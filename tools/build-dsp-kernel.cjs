/* Reproducible, dependency-free WebAssembly binary emitter for the PD inner loop.
 * f64 oscillator/envelope arithmetic; f32 band-limited tables and stereo output.
 * No imports, allocator, memory.grow, threads, or generated runtime glue.
 * Run: node tools/build-dsp-kernel.cjs
 */
const fs=require('node:fs'),path=require('node:path');
const P=8*13*8*1024*4,LEFT=P+256,RIGHT=LEFT+2048*4;
const u=n=>{let a=[];do{let b=n&127;n>>>=7;a.push(b|(n?128:0))}while(n);return a};
const si=n=>{let a=[],more=true;while(more){let b=n&127;n>>=7;more=!((n===0&&!(b&64))||(n===-1&&(b&64)));a.push(b|(more?128:0))}return a};
const flat=x=>x.flat(Infinity),str=s=>[...u(s.length),...Buffer.from(s)],vec=a=>[...u(a.length),...flat(a)],section=(id,a)=>[id,...u(a.length),...a];
const I=n=>[0x41,...si(n)],F=n=>[0x44,...new Uint8Array(new Float64Array([n]).buffer)];
const op={add:0xa0,sub:0xa1,mul:0xa2,div:0xa3,min:0xa4,max:0xa5,floor:0x9c,gt:0x64,lt:0x63,iadd:0x6a,imul:0x6c,ishl:0x74,ishr:0x76,ixor:0x73,iand:0x71,ilt:0x49,trunc:0xab,float:0xb8,promote:0xbb};
const e=(name,...args)=>[...flat(args),op[name]];
const types=[],funcs=[];
function func(name,params,locals,result,make){const names=[...params,...locals].map(a=>a[0]),get=n=>[0x20,...u(names.indexOf(n))],set=(n,x)=>[...flat(x),0x21,...u(names.indexOf(n))];const body=flat(make(get,set));let t=[0x60,...vec(params.map(p=>[p[1]==='i'?0x7f:0x7c])),...(result?[1,result==='i'?0x7f:0x7c]:[0])];types.push(t);let decl=vec(locals.map(l=>[1,l[1]==='i'?0x7f:0x7c]));funcs.push({name,body:[...decl,...body,0x0b]});}
const load32=index=>[...e('ishl',index,I(2)),0x2a,2,0,0xbb];
const load64=offset=>[...I(P+offset*8),0x2b,3,0];
const loadInt=offset=>[...I(P+192+offset*4),0x28,2,0];
const store64=(offset,x)=>[...I(P+offset*8),...flat(x),0x39,3,0];
const storeInt=(offset,x)=>[...I(P+192+offset*4),...flat(x),0x36,2,0];
const cond=(test,yes,no=[])=>[...flat(test),0x04,0x40,...flat(yes),...(no.length?[0x05,...flat(no)]:[]),0x0b];
func('wave',[['w','i'],['depth','f'],['band','i'],['phase','f']], [['di','f'],['d','i'],['x','f'],['i','i'],['j','i'],['f','f'],['a','i'],['b','i'],['v','f'],['z','f']], 'f',(g,s)=>[
 s('di',e('min',F(12),e('max',F(0),e('mul',g('depth'),F(12))))),s('d',e('trunc',g('di'))),
 s('x',e('mul',g('phase'),F(1024))),s('i',e('trunc',g('x'))),s('j',e('iand',e('iadd',g('i'),I(1)),I(1023))),s('f',e('sub',g('x'),e('float',g('i')))),
 s('a',e('ishl',e('iadd',e('imul',e('iadd',e('imul',g('w'),I(13)),g('d')),I(8)),g('band')),I(10))),s('b',g('a')),
 cond(e('ilt',g('d'),I(12)),s('b',e('iadd',g('a'),I(8192)))),
 s('v',e('add',load32(e('iadd',g('a'),g('i'))),e('mul',e('sub',load32(e('iadd',g('a'),g('j'))),load32(e('iadd',g('a'),g('i')))),g('f')))),
 s('z',e('add',load32(e('iadd',g('b'),g('i'))),e('mul',e('sub',load32(e('iadd',g('b'),g('j'))),load32(e('iadd',g('b'),g('i')))),g('f')))),
 e('add',g('v'),e('mul',e('sub',g('z'),g('v')),e('sub',g('di'),e('float',g('d')))))
]);
const floats=['ph0','st0','ds0','a0','da0','d0','dd0','lev0','ph1','st1','ds1','a1','da1','d1','dd1','lev1','fade','dfade','mix0','mix1','ring','noise','panL','panR'];
const ints=['w0','w20','b0','w1','w21','b1','use0','use1','seed'];
func('render',[['offset','i'],['count','i']], [...floats.map(n=>[n,'f']),...ints.map(n=>[n,'i']),['end','i'],['s0','f'],['s1','f'],['x','f'],['gain','f'],['ptr','i']],null,(g,s)=>{
 let body=[...floats.map((n,i)=>s(n,load64(i))),...ints.map((n,i)=>s(n,loadInt(i))),s('end',e('iadd',g('offset'),g('count')))];
 let loop=[];
 for(let n=0;n<2;n++){
  const wave=w=>[...g(w),...g('d'+n),...g('b'+n),...g('ph'+n),0x10,0];
  loop.push(s('ph'+n,e('add',g('ph'+n),g('st'+n))),s('ph'+n,e('sub',g('ph'+n),e('floor',g('ph'+n)))),s('st'+n,e('add',g('st'+n),g('ds'+n))),s('s'+n,F(0)),
   cond(g('use'+n),[s('s'+n,wave('w'+n)),cond(e('ilt',g('w2'+n),I(8)),s('s'+n,e('mul',e('add',g('s'+n),wave('w2'+n)),F(.5)))),s('s'+n,e('mul',e('mul',g('s'+n),g('a'+n)),g('lev'+n)))]));
 }
 loop.push(s('x',e('add',e('add',e('mul',g('s0'),g('mix0')),e('mul',g('s1'),g('mix1'))),e('mul',e('mul',g('s0'),g('s1')),g('ring')))),
  cond(e('gt',g('noise'),F(0)),[s('seed',e('ixor',g('seed'),e('ishl',g('seed'),I(13)))),s('seed',e('ixor',g('seed'),e('ishr',g('seed'),I(17)))),s('seed',e('ixor',g('seed'),e('ishl',g('seed'),I(5)))),s('x',e('add',g('x'),e('mul',e('mul',e('sub',e('mul',e('float',g('seed')),F(1/2147483648)),F(1)),g('noise')),g('a0'))))]),
  s('gain',e('mul',g('x'),e('min',F(1),e('max',F(0),g('fade'))))));
 for(let [side,base] of [['L',LEFT],['R',RIGHT]])loop.push(s('ptr',e('iadd',I(base),e('ishl',g('offset'),I(2)))),g('ptr'),g('ptr'),[0x2a,2,0,0xbb],e('mul',g('gain'),g('pan'+side)),[0xa0,0xb6,0x38,2,0]);
 for(let n=0;n<2;n++)loop.push(s('a'+n,e('add',g('a'+n),g('da'+n))),s('d'+n,e('add',g('d'+n),g('dd'+n))));
 loop.push(s('fade',e('add',g('fade'),g('dfade'))),s('offset',e('iadd',g('offset'),I(1))),e('ilt',g('offset'),g('end')),[0x0d,0]);
 body.push([0x03,0x40],loop,[0x0b],store64(0,g('ph0')),store64(8,g('ph1')),storeInt(8,g('seed')));return body;
});
const exportEntries=[['memory',2,0],['render',0,1]].map(([n,k,i])=>[...str(n),k,...u(i)]);
const bytes=new Uint8Array([0,97,115,109,1,0,0,0,...section(1,vec(types)),...section(3,vec(funcs.map((_,i)=>u(i)))),...section(5,[1,1,64,64]),...section(7,vec(exportEntries)),...section(10,vec(funcs.map(f=>[...u(f.body.length),...f.body])))]);
if(!WebAssembly.validate(bytes))throw Error('Invalid DSP module');
const sourceRoot=fs.existsSync(path.join(__dirname,'../dist/js'))?'../dist':'..';
const target=path.join(__dirname,sourceRoot,'js/dsp-kernel.js');
fs.writeFileSync(target,'// Generated by tools/build-dsp-kernel.cjs. No external runtime.\nconst pdKernelBase64="'+Buffer.from(bytes).toString('base64')+'";\n');
console.log('PD WebAssembly kernel:',bytes.length,'bytes');
