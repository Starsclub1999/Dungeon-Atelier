'use strict';

// Text-only chapters. Counts are filled by the book renderer from the live banks.
const helpBookContent = {
  ru: [
    {
      id: 'start', tab: 'Начало', title: 'Первый спуск',
      summary: 'Включение студии и первый законченный трек.',
      pages: [
        {
          heading: 'От START до первой ноты',
          paragraphs: [
            'Нажмите большую кнопку START. После пятисекундного вступления выберите русский или английский язык. На следующей странице можно открыть эту книгу или сразу войти в подземелье. Язык сохраняется в браузере; его можно сменить позже в справке или настройках.',
            'В студии нажмите «Включить звук». Браузер разрешает аудио после вашего действия, поэтому открытие страницы само по себе не запускает синтезатор. Первая подготовка волн занимает немного времени. Дождитесь индикатора включённого звука и нажмите любую клавишу пианино.'
          ],
          bullets: [
            'CZ-101 создаёт тембр; SKALD хранит и редактирует ноты.',
            'GRAV играет ударные; MOROK загружает согласованные комплекты.',
            'NACHT показывает итоговый звуковой сигнал после эффектов.'
          ]
        },
        {
          heading: 'Первый трек за несколько шагов',
          paragraphs: [
            'Для знакомства используйте MOROK внизу студии. Откройте жанр, выделите общий пресет и нажмите ENTER / LOAD. Загрузятся тембр, мелодия, ритм и подходящий набор ударных. Затем нажмите PLAY. Общий пресет удобен как отправная точка; после загрузки каждый прибор можно менять отдельно.',
            'Сначала послушайте целиком вступление и основную тему. Длинные пресеты развиваются во времени, поэтому первые несколько тактов не всегда показывают всю аранжировку. Остановите транспорт перед выбором другого комплекта, если хотите спокойно сравнить его параметры.'
          ],
          bullets: [
            'ALL или пробел запускает и останавливает ноты вместе с ударными.',
            'NOTES и DRUM позволяют слушать приборы по отдельности.',
            'SAVE SESSION сохраняет текущую работу; WAV сохраняет её звучание.'
          ]
        }
      ]
    },
    {
      id: 'keyboard', tab: 'Клавиши', title: 'Руки, клавиатура и MIDI',
      summary: 'Живая игра, колёса и подключение внешнего инструмента.',
      pages: [
        {
          heading: 'Игра без MIDI-клавиатуры',
          paragraphs: [
            'Нажимайте белые и чёрные клавиши мышью. Не отпуская кнопку мыши, ведите указатель по соседним клавишам: предыдущая нота отпускается, следующая звучит. Сенсорный экран поддерживает несколько пальцев. При воспроизведении SKALD клавиши тоже опускаются; хвост реверберации не удерживает их нажатие.',
            'На компьютерной клавиатуре играйте по физическому расположению A W S E D F T G Y H U J K O L P ;. Клавиша A начинает с C3 при исходной октаве. Если фокус находится в поле ввода, редакторе или открытом окне, музыкальные сочетания не перехватывают обычное редактирование.'
          ],
          bullets: [
            'Z / X меняют октаву; TRANSPOSE сдвигает строй на октаву.',
            'BEND меняет высоту до двух полутонов и возвращается в центр.',
            'MOD добавляет вибрато и сохраняет установленное положение.'
          ]
        },
        {
          heading: 'Внешний MIDI и удержание нот',
          paragraphs: [
            'Подключите MIDI-клавиатуру, откройте настройки и нажмите «Подключить MIDI». Разрешите доступ во всплывающем запросе браузера. В статусе появятся доступные входы. Нужна поддержка Web MIDI; разрешение зависит от браузера и адреса страницы. SysEx студия не запрашивает.',
            'Ноты с обычных каналов поступают на синтезатор, а канал 10 направляется в шесть дорожек GRAV по карте General MIDI. Velocity внешней клавиатуры передаётся в звук. MIDI-файл импортируется отдельно через MIDI ↑: подключение клавиатуры не записывает сыгранные ноты в piano roll.'
          ],
          bullets: [
            'CC64 управляет sustain; CC1 управляет MOD.',
            'Pitch Bend работает в диапазоне ±2 полутона.',
            'Кнопка SUSTAIN удерживает отпущенные живые ноты до её выключения.',
            'При зависшей ноте нажмите ALL NOTES OFF: остановятся транспорт и голоса.'
          ]
        }
      ]
    },
    {
      id: 'synthesis', tab: 'Синтез', title: 'Как устроен фазовый синтез',
      summary: 'Две линии, восемь форм и три огибающие на каждую линию.',
      pages: [
        {
          heading: 'DCO, DCW и DCA',
          paragraphs: [
            'Здесь используется программная интерпретация фазового искажения, или PD. Фаза определяет, как осциллятор проходит один период волны. DCW меняет этот ход внутри периода и вместе с ним количество и характер обертонов. Это управление яркостью через форму волны; отдельный TONE дополнительно фильтрует выход.',
            'У каждой из двух линий свои формы, громкость, октава и три восьмиступенчатые огибающие. DCO ENV меняет высоту, DCW ENV меняет глубину PD, DCA ENV задаёт громкость во времени. Для DCO уровень 0,5 соответствует нейтральной высоте; PITCH ENV задаёт размах изменения в полутонах.'
          ],
          bullets: [
            'LINE 1 / LINE 2 выбирают линию, которую вы редактируете.',
            'Режимы звучания: LINE 1, LINE 2, сумма 1 + 2 и произведение 1 × 2.',
            'DETUNE расстраивает вторую линию относительно первой в центах.'
          ]
        },
        {
          heading: 'Формы и восемь ступеней',
          paragraphs: [
            'В DCO WAVE доступны SAW, SQUARE, PULSE, DOUBLE SINE, SAW / PULSE и RESO I, II, III. Последние три дают разные резонансные окраски. У линии есть WAVE 1 и необязательная WAVE 2: включённые формы смешиваются внутри линии. Их характер раскрывается при изменении DCW.',
            'В редакторе огибающей каждая из восьми ступеней имеет время перехода в секундах и целевой уровень от 0 до 1. Огибающая доходит до выбранной точки SUSTAIN и удерживает её, пока нота нажата. После отпускания проходит оставшиеся ступени. Последний уровень DCA всегда равен нулю.'
          ],
          bullets: [
            'Для хора попробуйте медленную DCA-атаку и плавное открытие DCW.',
            'Для колокола используйте резонансную форму и быстро спадающую DCA.',
            'RING добавляет произведение линий; NOISE добавляет шумовую составляющую.'
          ]
        }
      ]
    },
    {
      id: 'controls', tab: 'Ручки', title: 'Панель синтезатора',
      summary: 'Основные ручки, детальные параметры и сохранение тембра.',
      pages: [
        {
          heading: 'Восемь ручек под экраном',
          paragraphs: [
            'Потяните ручку вверх или вниз, прокрутите над ней колесо либо выделите её клавишей Tab и нажимайте стрелки. Shift уменьшает шаг. Значение под ручкой помогает точно повторить настройку. Сначала выберите LINE 1 или LINE 2: DCW и четыре ручки громкостной огибающей относятся к активной линии.',
            'ATTACK задаёт нарастание, DECAY — спад после пика, SUSTAIN — удерживаемый уровень, RELEASE — суммарное затухание после отпускания. Эти ручки заново формируют удобную восьмиступенчатую DCA. Если вы тщательно редактировали её ступени вручную, дальнейшее движение ADSR-ручек изменит эту форму.'
          ],
          bullets: [
            'DCW задаёт глубину фазового искажения активной линии.',
            'TONE регулирует общую яркость выходным фильтром.',
            'CHAMBER и ECHO управляют общими реверберацией и задержкой тембра.'
          ]
        },
        {
          heading: 'Детали и собственные звуки',
          paragraphs: [
            'FX / MIX открывает расширенные настройки; DCO WAVE и VIBRATO ведут в то же окно. Для каждой линии можно выбрать обе формы, LEVEL и OCTAVE от −2 до +2. Глобальные параметры включают глубину и скорость вибрато, примесь RING и NOISE, размах высотной огибающей, chorus, delay, реверберацию, TONE и PREAMP.',
            'Звёздочка на экране отмечает изменённый тембр. WRITE сохраняет пользовательский вариант в памяти этого браузера и адреса. Для переноса на другой компьютер сохраните сессию. MUTATE делает вариацию тембра: это быстрый способ найти новый оттенок, но результат стоит послушать перед сохранением.'
          ],
          bullets: [
            'Стрелки рядом с банком переключают соседние доступные тембры.',
            'Выбор заводского тембра заменяет текущие настройки синтеза.',
            'Сначала сохраните удачный вариант, затем пробуйте сильные изменения.'
          ]
        }
      ]
    },
    {
      id: 'polyphony', tab: 'Голоса', title: 'Полифония и длинные хвосты',
      summary: 'Как выбрать 4, 8, 16, 32 или 64 голоса.',
      pages: [
        {
          heading: 'Что считается голосом',
          paragraphs: [
            'Один голос — одна звучащая нота синтезатора со своими двумя линиями и огибающими. Аккорд из четырёх нот занимает четыре голоса даже в режиме 1 + 2. Нота после отпускания продолжает занимать голос, пока её DCA не затихнет. Поэтому длинные release быстро увеличивают нагрузку при частой смене аккордов.',
            'На видимой панели полифонии можно выбрать 4, 8, 16, 32 или 64 голоса. Счётчик на LCD показывает текущую нагрузку и установленный предел. Предел синтезатора не отнимает дорожки у GRAV: у ударных отдельный пул воспроизведения.'
          ],
          bullets: [
            '4–8 подходят для коротких лидов, басов и намеренно тесного звучания.',
            '16–32 удобны для большинства аккордов и многослойных партий.',
            '64 дают больше места плотным партитурам и долгим релизам.'
          ]
        },
        {
          heading: 'Авто и ручной предел',
          paragraphs: [
            'В режиме AUTO выбор тембра или нотного пресета подбирает подходящую полифонию. Это помогает переходить от редкого баса к плотному хору без постоянного открытия меню. Ручной выбор фиксирует предел для ваших экспериментов. Чтобы снова доверить выбор пресетам, включите AUTO на той же панели.',
            'Если голосов не хватает, движок освобождает подходящий голос с плавным завершением, отдавая предпочтение тихим отпущенным нотам. Очень низкий предел меняет фактуру: отдельные хвосты будут обрываться раньше, даже если компьютер способен обработать больше. Повышение предела помогает лишь при реальной нехватке голосов.'
          ],
          bullets: [
            'Для густого дрона увеличьте предел и уменьшите громкость слоёв.',
            'При треске попробуйте 32 или 16, укоротите RELEASE и проверьте нагрузку.',
            'Долгий CHAMBER может звучать после освобождения синтезаторного голоса.'
          ]
        }
      ]
    },
    {
      id: 'skald', tab: 'SKALD', title: 'Нотная мастерская SKALD',
      summary: 'Редактирование, генерация и навигация по длинным композициям.',
      pages: [
        {
          heading: 'Рисование и редактирование нот',
          paragraphs: [
            'Инструмент НОТА добавляет звук кликом по сетке. Его высота задаётся строкой, позиция — столбцом. СЕТКА определяет привязку, ДЛИНА — длительность новой ноты, VELOCITY — силу. Перетаскивайте тело ноты для переноса, правый край — для изменения длительности. ПКМ или ЛАСТИК удаляют ноту; на сенсорном экране используйте ЛАСТИК.',
            'Shift + клик добавляет ноты в выделение. Инструмент ВЫБОР выделяет прямоугольником. Операции применяются ко всему выделению: можно передвинуть аккорд, изменить его силу, скопировать фразу или удалить несколько нот. Полоса velocity под сеткой позволяет менять силу нот рядом с выбранным моментом.'
          ],
          bullets: [
            'Ctrl+A/C/V — выделить всё, копировать, вставить; Delete — удалить.',
            'Для вставки сначала укажите место кликом; стрелки двигают выделение.',
            'Ctrl+Z — отмена; Ctrl+Y или Ctrl+Shift+Z — повтор.',
            'QUANTIZE выравнивает выделенные ноты, а без выделения — всю партию.'
          ]
        },
        {
          heading: 'Длина, цикл и развитие',
          paragraphs: [
            'ZOOM меняет временной масштаб, колесо — видимый регистр, Shift + колесо — прокрутку по времени, Ctrl + колесо — масштаб. PITCH ± сдвигают вид на октаву; FIT помещает ноты в подходящий регистр. Нижний обзор переносит вид к любой части длинной композиции. Shift + клик по обзору также переносит транспорт.',
            'Потяните ближайший край толстой верхней полосы, чтобы задать участок воспроизведения. Линейка ниже переносит позицию. LOOP повторяет выбранные участки; с выключенным LOOP транспорт доходит до конца более длинной партии, а короткая может повторяться внутри неё. FOLLOW следит за текущей позицией.'
          ],
          bullets: [
            'ТАКТОВ + RESIZE меняет длину; ПРОДОЛЖИТЬ ×2 добавляет развитие копии.',
            'ROOT, SCALE, OCT и ПЛОТНОСТЬ влияют на генерацию авторских вариаций.',
            'Реальные партитуры редактируются вручную; генератор их не подменяет.',
            'MIDI ↑ открывает выбор дорожек; MIDI ↓ сохраняет ноты в файл.'
          ]
        }
      ]
    },
    {
      id: 'grav', tab: 'GRAV', title: 'Ритуальная перкуссия GRAV',
      summary: 'Шесть дорожек, звуковые наборы и управление ударом.',
      pages: [
        {
          heading: 'Ритм и звук — разные вещи',
          paragraphs: [
            'В GRAV шесть дорожек: BASS, FRAME, RATTLE, TOM, BELL и GONG. Ритмический пресет задаёт моменты и силу ударов, а набор УДАРНЫЕ выбирает их звучание. Всего доступно {{kits}} наборов: от кожи, дерева, кости и бронзы до кассеты, мягких шорохов, FM и 8/16-bit. Звуки синтезированы моделью.',
            'Слушайте отдельные инструменты нижними пэдами или нажатием названия дорожки слева от сетки. LEVEL регулирует громкость всей перкуссии. SPACE задаёт её посыл в общее помещение, DAMP приглушает верхние частоты, TUNE сдвигает строй до октавы вверх или вниз. Эти настройки не меняют огибающие синтезатора.'
          ],
          bullets: [
            'Общий пресет MOROK выбирает собственный подходящий набор.',
            'После загрузки любой набор можно заменить вручную.',
            'Тихий колокол и низкий редкий пульс часто лучше поддерживают дрон, чем частые удары.'
          ]
        },
        {
          heading: 'Редактирование аранжировки',
          paragraphs: [
            'Клик по пустой клетке добавляет удар; клик по заполненной удаляет. Протягивание продолжает действие цепочкой. ПКМ стирает. Shift ставит тихие удары, а Alt + вертикальное движение меняет velocity. Сила видна в заполнении клетки; чередуйте акценты и тихие удары, чтобы ритм дышал.',
            'Ритмические пресеты развиваются на протяжении трека: вступления, паузы, смены рисунка и сбивки связаны с формой. FILL / ВАРИАЦИЯ создаёт другой аранжированный вариант. Отмена возвращает предыдущее состояние. CLEAR очищает клетки, поэтому перед большой правкой полезно сохранить сессию.'
          ],
          bullets: [
            'Обзор, прокрутка, ZOOM и FOLLOW работают как у нотного редактора.',
            'Границы верхней полосы независимы от участка SKALD.',
            'RESIZE меняет длину; ПРОДОЛЖИТЬ ×2 добавляет продолжение со сбивками.',
            'SWING смещает нечётные шестнадцатые у общего транспорта; MIDI ↑/↓ переносит ритм.'
          ]
        }
      ]
    },
    {
      id: 'morok', tab: 'MOROK', title: 'Архив комплектов MOROK',
      summary: 'Общие пресеты, жанры и автоматический запуск.',
      pages: [
        {
          heading: 'Навигация по зелёному экрану',
          paragraphs: [
            'MOROK объединяет {{performances}} общих пресетов по жанрам. На первом экране выберите жанр. На следующем найдите комплект; стрелки вверх и вниз перемещают выделение, ENTER / LOAD открывает жанр или загружает комплект. BACK возвращает к жанрам. Нижняя область экрана показывает связанные звуки, темп, длительность и партии.',
            'Выделение строки ещё не заменяет музыку: загрузка выполняется кнопкой ENTER / LOAD или двойным нажатием на пресет. Так можно спокойно просматривать варианты. После загрузки статус LOADED показывает название выбранного комплекта. PLAY / STOP управляет совместным транспортом SKALD и GRAV.'
          ],
          bullets: [
            'Общий пресет выбирает тембр, ноты, ритм и звуковой набор ударных.',
            'AUTO PLAY включает автоматическое начало после загрузки.',
            'При AUTO-полифонии вместе с материалом подбирается предел голосов.'
          ]
        },
        {
          heading: 'От демонстрации к своей музыке',
          paragraphs: [
            'Связанный комплект — готовая отправная точка для прослушивания и редактирования. После его загрузки попробуйте выбрать другой тембр в синтезаторе, оставить исходные ноты и заменить набор GRAV. Затем выключите ударные и послушайте, какие ноты формируют гармонию. Приборы остаются независимыми; повторно загружать комплект для каждого изменения не нужно.',
            'Повторная загрузка общего пресета заново установит его партии и тембр. Если вы уже отредактировали музыку, сначала сохраните сессию. Современные артистические комплекты могут открывать окно источника и пользовательского MIDI-слота: пустой слот не превращается автоматически в нотную транскрипцию записи.'
          ],
          bullets: [
            'Для сравнения тембров оставляйте одну и ту же мелодию.',
            'Для тихого фона уменьшайте LEVEL GRAV и посыл ECHO.',
            'Отключите AUTO PLAY, если хотите подготовить параметры перед запуском.'
          ]
        }
      ]
    },
    {
      id: 'banks', tab: 'Пресеты', title: 'Тембры, партитуры и источники',
      summary: 'Что содержат банки и как отличить композицию от стилизации.',
      pages: [
        {
          heading: 'Что находится в архиве',
          paragraphs: [
            'В банках {{timbres}} тембров, {{scores}} готовых нотных композиций, {{slots}} пользовательских MIDI-слотов и {{rhythms}} ритмических аранжировок. Каждый прибор имеет собственные жанровые фильтры и поиск. Метка ◆ обозначает исходные пресеты раннего банка. «Банк тембров» открывает карточки с описаниями звучания; загрузка карточки меняет синтезатор.',
            'Авторские композиции строятся из тем, ответов, контрастных частей и возвращений. Они вдохновлены музыкальными направлениями и артистами, но не объявляются их оригинальными произведениями. Реальные партитуры отдельно помечены источником. Среди них средневековые песни, традиционные мелодии, классика и лицензированные игровые композиции.'
          ],
          bullets: [
            'Game scores / Rusted 8-bit — отдельная игровая музыка, без подмены жанра.',
            'Короткая исходная партитура может повторяться целиком; это указано в описании.',
            'Упоминание игры или фильма у классики не означает точную саундтрековую аранжировку.'
          ]
        },
        {
          heading: 'Misanthrop и современные источники',
          paragraphs: [
            'Кнопка современных источников открывает артистические слоты: Blod Besvimelse / Misanthrop, Aufhocker, Fief, Old Tower, Depressive Silence, Mortiis, Burzum и другие звуковые ориентиры. В таких слотах есть палитра синтезатора и ритма, страница источника и, где доступно, внешний проигрыватель. Защищённая запись или её полная транскрипция в проект не встроена.',
            'Для игры и редактирования импортируйте свой MIDI в выбранный слот. Только эти ноты станут его партией; до импорта слот пуст. Они сохраняются в IndexedDB этого браузера. Внешняя запись воспроизводится отдельно от аудиотракта студии и не попадает в WAV.'
          ],
          bullets: [
            'ИСТОЧНИКИ / ТИП ПРЕСЕТА показывает происхождение текущего материала.',
            'Лицензии и исходные MIDI включены в SOURCES.md и assets.',
            'Перед очисткой данных браузера сохраните важные ноты, тембры и сессии в файлы.'
          ]
        }
      ]
    },
    {
      id: 'effects', tab: 'FX / NACHT', title: 'Пространство и осциллограф',
      summary: 'Эффекты, выходной уровень и чтение волны.',
      pages: [
        {
          heading: 'Построение пространства',
          paragraphs: [
            'CHAMBER добавляет хвост помещения. У синтезатора и GRAV независимые посылы в общий стереоревербератор: можно оставить барабаны сухими, а хор отодвинуть в глубину. ECHO / DELAY MIX задаёт слышимость повторов, DELAY TIME — интервал между ними в секундах. CHORUS добавляет медленно меняющуюся задержку и расширяет ощущение тембра.',
            'TONE приглушает или открывает верх, PREAMP меняет насыщенность и уровень сухого сигнала. Эти эффекты входят в WAV. MASTER регулирует общий музыкальный выход и также влияет на запись. Выходной компрессор смягчает пики, но не заменяет аккуратный баланс слишком громких слоёв.'
          ],
          bullets: [
            'Если мелодия теряется, уменьшите CHAMBER и DELAY MIX.',
            'При мутных аккордах укоротите RELEASE или уменьшите низкие слои.',
            'Длинный хвост после STOP — работа эффектов, а не зажатая клавиша.'
          ]
        },
        {
          heading: 'NACHT: увидеть звук',
          paragraphs: [
            'NACHT анализирует итоговый стереомикс после эффектов и выходной обработки. WAVEFORM показывает изменение амплитуды во времени. TIME / DIV меняет временной масштаб; GAIN увеличивает высоту следа только на экране и не делает музыку громче. HOLD замораживает изображение, сохраняя воспроизведение.',
            'SPECTRUM показывает распределение энергии по частотам. У почти чистого тона заметен основной пик; яркие формы и шум добавляют другие составляющие. Показания Hz и периода T — оценка основной периодичности. Для аккордов, гонга, шума и сильной реверберации единственная точная высота может не определяться.'
          ],
          bullets: [
            'Один полный повтор формы соответствует одному периоду колебания.',
            'Для устойчивой картинки начните с одной удерживаемой ноты.',
            'Показатель dB помогает сравнивать уровни; это не измеритель громкости помещения.',
            'Звуки кнопок имеют отдельный выход и не меняют музыкальную волну NACHT.'
          ]
        }
      ]
    },
    {
      id: 'recording', tab: 'Запись', title: 'WAV, MIDI и сессии',
      summary: 'Три способа сохранить результат и перенести работу.',
      pages: [
        {
          heading: 'Запись слышимого результата',
          paragraphs: [
            'Нажмите ● Запись WAV, затем включите транспорт или играйте руками. Запись захватывает музыкальный выход студии после эффектов и выходного компрессора. В неё входят синтезатор, ударные и положение MASTER. Микрофон не используется. Писки кнопок, тумблеры, заставка и внешний плеер источника в музыкальную запись не попадают.',
            'Повторное нажатие завершает захват. Дождитесь подготовки файла и нажмите «Скачать WAV» в появившейся панели. Формат — стерео PCM 16 bit с частотой основного аудиоконтекста, обычно 48 kHz. Чтобы сохранить окончание реверберации, остановите музыку, подождите хвост и только затем завершите запись.'
          ],
          bullets: [
            'Таймер WAV показывает длительность захвата, включая паузы.',
            'Длинная запись занимает память до подготовки файла.',
            'Для лицензированных партитур сведения об источнике добавляются в метаданные WAV.'
          ]
        },
        {
          heading: 'Сохранить редактируемую работу',
          paragraphs: [
            'SAVE SESSION выгружает JSON с текущим тембром, нотами, ударными, длинами, границами циклов, темпом, эффектами, набором перкуссии и настройками. LOAD восстанавливает его; читаются также старые сессии v1. Это основной способ перенести проект или вернуться к нему после очистки браузера. Сам WAV не содержит редактируемую аранжировку.',
            'MIDI ↓ сохраняет музыкальные события отдельного прибора, ALL MIDI ↓ — ноты и ударные вместе. MIDI хранит ноты, время и силу, но не воспроизводит тембр PD и эффекты на другом синтезаторе автоматически. Импорт MIDI ↑ предлагает выбрать дорожки, назначение, применение темпа и необязательную привязку к сетке.'
          ],
          bullets: [
            'Поддерживаются MIDI type 0/1, sustain и пересчёт изменений темпа.',
            'В режиме «Оба прибора» канал 10 отправляется в GRAV.',
            'Ноты сохраняют дробное время; ударные привязываются к шагу 1/16.',
            'WRITE сохраняет только тембр в браузере; JSON нужен для всей студии.'
          ]
        }
      ]
    },
    {
      id: 'system', tab: 'Система', title: 'Настройки и спокойная работа',
      summary: 'Язык, звуки приборов, производительность и решение проблем.',
      pages: [
        {
          heading: 'Настройки и удобство',
          paragraphs: [
            'Язык можно переключать в этой книге и в настройках. Переводится интерфейс и отображаемые названия пресетов; сами ноты, тембры и исходные данные композиций не меняются. Кнопка повторного показа заставки возвращает начало. Настройка «Звуки приборов» включает или отключает служебные щелчки и писки.',
            'В настройках также находятся MASTER, сила живой игры VELOCITY, подключение MIDI и сведения о звуковом движке и базовой задержке. Полифония вынесена на синтезатор, чтобы предел голосов был виден во время игры. Книга открывается кнопкой «Справка» рядом с включением звука или после вступления.'
          ],
          bullets: [
            'Для точной настройки ручек удерживайте Shift.',
            'Escape закрывает обычные окна и отпускает живые клавиши.',
            'FOLLOW можно отключить, чтобы редактор не возвращался к текущей ноте.',
            'Сохранение файлов надёжнее памяти одной вкладки или браузера.'
          ]
        },
        {
          heading: 'Если звук прерывается',
          paragraphs: [
            'Основной движок использует AudioWorklet, компактное ядро WebAssembly и заранее выделенные голоса. При недоступности WASM работает JavaScript-ядро. Весь транспорт нот и ударных рассчитывается в аудиопотоке; прорисовка экрана не запускает очередную ноту. На HTTPS и localhost доступен основной режим. Прямое открытие файла может включить совместимый буферный режим.',
            'При треске посмотрите число голосов, уменьшите полифонию, сократите длинный RELEASE и закройте тяжёлые вкладки. При тишине проверьте включение звука, POWER, MASTER, громкость GRAV и состояние транспорта. Если браузер приостановил звук, нажмите включение снова. ALL NOTES OFF помогает прекратить зависшие ноты и начать заново.'
          ],
          bullets: [
            'Высокий предел голосов даёт запас, но требует больше вычислений.',
            'Задержка зависит также от браузера, драйвера и аудиоустройства.',
            'Это самостоятельная интерпретация CZ-101, а не точная копия аппаратной схемы.',
            'Для музыкального результата лучше проверить громкость и хвосты собственным слухом.'
          ]
        }
      ]
    }
  ],
  en: [
    {
      id: 'start', tab: 'Start', title: 'The first descent',
      summary: 'Power up the studio and play your first complete arrangement.',
      pages: [
        {
          heading: 'From START to the first note',
          paragraphs: [
            'Press the large START button. After the five-second opening, choose Russian or English. The next page lets you open this book or enter the dungeon. Your language choice stays in this browser; you can change it later in the guide or settings.',
            'Inside the studio, press “Enable audio”. Browsers allow sound after a user action, so opening the page alone does not start the synthesizer. Preparing the wave tables takes a moment on the first run. Wait for the audio indicator, then press a piano key.'
          ],
          bullets: [
            'CZ-101 makes the sound; SKALD stores and edits the notes.',
            'GRAV plays percussion; MOROK loads coordinated arrangements.',
            'NACHT displays the final musical signal after effects.'
          ]
        },
        {
          heading: 'A first track in a few steps',
          paragraphs: [
            'Start with MOROK at the bottom of the studio. Open a genre, highlight a performance and press ENTER / LOAD. The synth sound, melody, rhythm and a matching drum kit will load together. Then press PLAY. A performance is a useful starting point; you can change each device independently afterwards.',
            'Listen through the introduction and the main theme. Long presets develop over time, so the first few bars may not reveal the whole arrangement. Stop the transport before loading another performance if you want time to compare its settings.'
          ],
          bullets: [
            'ALL or Space starts and stops notes and drums together.',
            'NOTES and DRUM let you hear the two parts separately.',
            'SAVE SESSION saves your work; WAV saves the sound it produces.'
          ]
        }
      ]
    },
    {
      id: 'keyboard', tab: 'Keys', title: 'Hands, keys and MIDI',
      summary: 'Live playing, performance wheels and an external keyboard.',
      pages: [
        {
          heading: 'Playing without a MIDI keyboard',
          paragraphs: [
            'Click the white and black piano keys. Keep the mouse button held and drag across neighbouring keys: the previous note releases and the next one starts. A touch screen supports several fingers. The keys also move while SKALD plays; a reverb tail does not keep a key pressed.',
            'On a computer keyboard, use the physical positions A W S E D F T G Y H U J K O L P ;. A starts on C3 at the original octave. Musical shortcuts leave normal editing alone when an input, editor or dialog has focus.'
          ],
          bullets: [
            'Z / X change octave; TRANSPOSE shifts the tuning by an octave.',
            'BEND moves pitch by up to two semitones and springs back to centre.',
            'MOD adds vibrato and keeps its position after you let go.'
          ]
        },
        {
          heading: 'External MIDI and held notes',
          paragraphs: [
            'Connect a MIDI keyboard, open settings and press “Connect MIDI”. Allow access in the browser prompt. Available inputs appear in the status display. Web MIDI support is required; availability and permissions depend on your browser and the page address. The studio does not request SysEx.',
            'Normal MIDI channels play the synthesizer. Channel 10 goes to the six GRAV lanes using the General MIDI percussion map. The keyboard’s note velocity reaches the sound engine. Import a MIDI file separately with MIDI ↑: connecting a live keyboard does not record the notes you play into the piano roll.'
          ],
          bullets: [
            'CC64 controls sustain; CC1 controls MOD.',
            'Pitch Bend has a range of ±2 semitones.',
            'SUSTAIN holds released live notes until you turn it off.',
            'If a note becomes stuck, ALL NOTES OFF stops the transport and sounding voices.'
          ]
        }
      ]
    },
    {
      id: 'synthesis', tab: 'Synthesis', title: 'Inside phase distortion',
      summary: 'Two lines, eight waveforms and three envelopes per line.',
      pages: [
        {
          heading: 'DCO, DCW and DCA',
          paragraphs: [
            'This instrument is a software interpretation of phase distortion, or PD. Phase describes how an oscillator moves through one wave cycle. DCW changes that movement within the cycle, altering the number and character of overtones. It shapes brightness through the waveform; the separate TONE control also filters the output.',
            'Each of the two lines has its own waveforms, level, octave and three eight-stage envelopes. DCO ENV changes pitch, DCW ENV changes PD depth and DCA ENV shapes loudness over time. For DCO, a level of 0.5 is neutral pitch; PITCH ENV sets the pitch excursion in semitones.'
          ],
          bullets: [
            'LINE 1 / LINE 2 select the line you are editing.',
            'Sound modes are LINE 1, LINE 2, the sum 1 + 2 and the product 1 × 2.',
            'DETUNE offsets the second line from the first in cents.'
          ]
        },
        {
          heading: 'Waves and eight stages',
          paragraphs: [
            'DCO WAVE offers SAW, SQUARE, PULSE, DOUBLE SINE, SAW / PULSE and RESO I, II, III. The last three provide different resonant colours. Each line has WAVE 1 and an optional WAVE 2: active waveforms are mixed within that line. Their character changes as you adjust DCW.',
            'Every envelope stage has a transition time in seconds and a target level from 0 to 1. The envelope reaches the selected SUSTAIN point and holds it while the note remains pressed. On release, it runs through the remaining stages. The last DCA level is always zero.'
          ],
          bullets: [
            'For a choir, try a slow DCA attack and a gentle DCW opening.',
            'For a bell, try a resonant wave and a quickly falling DCA.',
            'RING adds the product of the lines; NOISE adds a noise component.'
          ]
        }
      ]
    },
    {
      id: 'controls', tab: 'Controls', title: 'The synthesizer panel',
      summary: 'Main knobs, detailed parameters and saving a sound.',
      pages: [
        {
          heading: 'Eight knobs below the display',
          paragraphs: [
            'Drag a knob up or down, use the mouse wheel over it, or focus it with Tab and use the arrow keys. Hold Shift for a smaller step. The value below each knob helps you repeat a setting. First choose LINE 1 or LINE 2: DCW and the four amplitude-envelope knobs belong to the active line.',
            'ATTACK sets the rise, DECAY the fall after the peak, SUSTAIN the held level and RELEASE the total fade after note-off. These knobs rebuild a convenient eight-stage DCA shape. Moving them after detailed envelope editing will change the shape you drew.'
          ],
          bullets: [
            'DCW sets phase-distortion depth for the active line.',
            'TONE controls overall brightness with an output filter.',
            'CHAMBER and ECHO control the sound’s overall reverb and delay.'
          ]
        },
        {
          heading: 'Details and your own sounds',
          paragraphs: [
            'FX / MIX opens the detailed controls; DCO WAVE and VIBRATO open the same window. For each line, choose both waveforms, LEVEL and an OCTAVE from −2 to +2. Global controls include vibrato depth and rate, RING and NOISE mixes, pitch-envelope range, chorus, delay, reverb, TONE and PREAMP.',
            'An asterisk on the display marks an edited sound. WRITE saves a user version in this browser at this address. Save a session to move it to another computer. MUTATE makes a sound variation: it is a quick way to discover another colour, but listen to the result before saving it.'
          ],
          bullets: [
            'The arrows next to the bank move through available sounds.',
            'Choosing a factory sound replaces the current synthesis settings.',
            'Save a sound you like before trying stronger changes.'
          ]
        }
      ]
    },
    {
      id: 'polyphony', tab: 'Voices', title: 'Polyphony and long tails',
      summary: 'Choosing a limit of 4, 8, 16, 32 or 64 voices.',
      pages: [
        {
          heading: 'What counts as a voice',
          paragraphs: [
            'One voice is one sounding synthesizer note with its own two lines and envelopes. A four-note chord uses four voices even in 1 + 2 mode. A released note still occupies a voice until its DCA becomes silent. Long releases can therefore build up voice use quickly when chords change often.',
            'The visible polyphony panel lets you choose 4, 8, 16, 32 or 64 voices. The LCD counter shows current voice use and the selected limit. This synth limit does not remove GRAV lanes: percussion has a separate playback pool.'
          ],
          bullets: [
            '4–8 suit short leads, basses and deliberately limited textures.',
            '16–32 work well for most chords and layered arrangements.',
            '64 leave more room for dense scores and long releases.'
          ]
        },
        {
          heading: 'Automatic and manual limits',
          paragraphs: [
            'In AUTO mode, choosing a sound or note preset selects a suitable polyphony limit. This makes it easier to move from a sparse bass to a dense choir without reopening menus. Choosing a limit manually fixes it for your experiments. Enable AUTO on the same panel to let presets choose again.',
            'When voices run out, the engine smoothly finishes a suitable voice, preferring quiet released notes. A very low limit changes the texture: some tails end earlier even if your computer could process more. Increasing the limit helps when the part really needs extra voices.'
          ],
          bullets: [
            'For a dense drone, raise the limit and lower the layer levels.',
            'For crackles, try 32 or 16, shorten RELEASE and check system load.',
            'A long CHAMBER tail can remain audible after a synth voice is freed.'
          ]
        }
      ]
    },
    {
      id: 'skald', tab: 'SKALD', title: 'The SKALD note workshop',
      summary: 'Editing, generating and navigating long compositions.',
      pages: [
        {
          heading: 'Drawing and editing notes',
          paragraphs: [
            'The NOTE tool adds a note when you click the grid. Its row sets pitch and its column sets time. GRID sets snapping, LENGTH sets the new note’s duration and VELOCITY sets its strength. Drag the note body to move it or its right edge to resize it. Right-click or ERASER deletes a note; use ERASER on a touch screen.',
            'Shift + click adds notes to the selection. SELECT draws a selection rectangle. Edits apply to all selected notes: move a chord, change its strength, copy a phrase or delete several notes together. The velocity lane below the grid changes note strength near the chosen time.'
          ],
          bullets: [
            'Ctrl+A/C/V selects all, copies and pastes; Delete removes the selection.',
            'Click a destination before pasting; arrow keys move selected notes.',
            'Ctrl+Z undoes; Ctrl+Y or Ctrl+Shift+Z redoes.',
            'QUANTIZE aligns selected notes, or the whole part if nothing is selected.'
          ]
        },
        {
          heading: 'Length, loops and development',
          paragraphs: [
            'ZOOM changes the time scale. The mouse wheel moves the visible pitch range; Shift + wheel scrolls time and Ctrl + wheel zooms. PITCH ± shift the view by an octave; FIT finds a suitable pitch range. The overview below jumps to any part of a long composition. Shift + click there also moves playback.',
            'Drag the nearest end of the thick top strip to set the playback region. The ruler beneath it moves the position. LOOP repeats the regions; with LOOP off, playback reaches the end of the longer part while a shorter part may repeat inside it. FOLLOW tracks playback.'
          ],
          bullets: [
            'BARS + RESIZE changes length; CONTINUE ×2 develops a copied continuation.',
            'ROOT, SCALE, OCT and DENSITY shape generated author variations.',
            'Edit real scores by hand; the generator does not replace them.',
            'MIDI ↑ opens track selection; MIDI ↓ saves the notes to a file.'
          ]
        }
      ]
    },
    {
      id: 'grav', tab: 'GRAV', title: 'GRAV ritual percussion',
      summary: 'Six lanes, sound kits and the shape of each hit.',
      pages: [
        {
          heading: 'The rhythm and the sound',
          paragraphs: [
            'GRAV has six lanes: BASS, FRAME, RATTLE, TOM, BELL and GONG. A rhythm preset sets when and how strongly they play; the drum kit chooses their sound. There are {{kits}} kits, ranging from skin, wood, bone and bronze to cassette, soft rustles, FM and 8/16-bit colours. The sounds are modelled synthetically.',
            'Audition an instrument with the lower pads or its lane name on the left of the grid. LEVEL sets overall percussion volume. SPACE sends it into the shared room, DAMP softens high frequencies and TUNE shifts tuning up or down by as much as an octave. These controls leave synth envelopes alone.'
          ],
          bullets: [
            'A MOROK performance chooses a matching kit of its own.',
            'You can replace the kit manually after loading.',
            'A quiet bell and a sparse low pulse often support a drone better than constant hits.'
          ]
        },
        {
          heading: 'Editing the arrangement',
          paragraphs: [
            'Click an empty cell to add a hit or a filled one to remove it. Drag to continue drawing or erasing a chain. Right-click erases. Shift adds quiet hits; Alt + vertical movement changes velocity. The cell’s fill shows strength. Alternate accents and softer hits to give the rhythm room to breathe.',
            'Rhythm presets develop throughout the track: introductions, pauses, pattern changes and fills follow the form. FILL / VARIATION builds another arranged version. Undo restores the previous state. CLEAR empties the cells, so save a session before making large changes.'
          ],
          bullets: [
            'Overview, scrolling, ZOOM and FOLLOW work like the note editor.',
            'The top playback region is independent of SKALD’s region.',
            'RESIZE changes length; CONTINUE ×2 adds a continuation with fills.',
            'SWING delays odd sixteenths in the shared transport; MIDI ↑/↓ transfers the rhythm.'
          ]
        }
      ]
    },
    {
      id: 'morok', tab: 'MOROK', title: 'The MOROK performance archive',
      summary: 'Coordinated presets, genres and automatic playback.',
      pages: [
        {
          heading: 'Navigating the green display',
          paragraphs: [
            'MOROK groups {{performances}} performance presets by genre. Choose a genre on the first screen, then find a performance. Up and down move the highlight; ENTER / LOAD opens a genre or loads a performance. BACK returns to genres. The lower display describes the linked sound, tempo, duration and musical parts.',
            'Highlighting a row alone does not replace your music: load it with ENTER / LOAD or double-click the preset. This leaves time to browse. After loading, LOADED shows the selected performance name. PLAY / STOP controls the shared SKALD and GRAV transport.'
          ],
          bullets: [
            'A performance selects the sound, notes, rhythm and percussion kit.',
            'AUTO PLAY starts playback automatically after loading.',
            'With AUTO polyphony enabled, the material also receives a suitable voice limit.'
          ]
        },
        {
          heading: 'From demonstration to your music',
          paragraphs: [
            'A linked performance gives you a starting point for listening and editing. Once it loads, try another synth sound while keeping the notes, then replace the GRAV kit. Mute the drums and listen to the notes that form the harmony. The devices remain independent; there is no need to reload the performance after each adjustment.',
            'Loading a performance again restores its parts and sound. Save a session first if you have edited the music. Contemporary artist performances may open a source and user MIDI-slot window: an empty slot does not automatically become a transcription of the recording.'
          ],
          bullets: [
            'Keep one melody playing when comparing synth sounds.',
            'For a quiet background, lower GRAV LEVEL and the ECHO send.',
            'Disable AUTO PLAY if you want to prepare settings before starting.'
          ]
        }
      ]
    },
    {
      id: 'banks', tab: 'Presets', title: 'Sounds, scores and sources',
      summary: 'What the banks contain and how to identify the music.',
      pages: [
        {
          heading: 'Inside the archive',
          paragraphs: [
            'The banks hold {{timbres}} sounds, {{scores}} prepared note compositions, {{slots}} user MIDI slots and {{rhythms}} rhythm arrangements. Each device has independent genre filters and search. ◆ marks original presets from the early bank. The sound library opens cards with descriptions; loading a card changes the synthesizer.',
            'Author compositions use themes, answers, contrasting sections and returns. They draw inspiration from musical styles and artists but are not presented as those artists’ original works. Real scores carry separate source labels. They include medieval songs, traditional melodies, classical pieces and licensed game compositions.'
          ],
          bullets: [
            'Game scores / Rusted 8-bit is a separate game-music bank, without relabelling its genre.',
            'A short source score may repeat in full; its description says so.',
            'A game or film reference beside a classical piece does not promise the exact soundtrack arrangement.'
          ]
        },
        {
          heading: 'Misanthrop and modern sources',
          paragraphs: [
            'The modern sources button opens artist slots: Blod Besvimelse / Misanthrop, Aufhocker, Fief, Old Tower, Depressive Silence, Mortiis, Burzum and other sound references. These provide a synth and rhythm palette, a source page and an external player where available. Protected recordings and their complete transcriptions are not bundled with the project.',
            'To play and edit notes, import your own MIDI into the chosen slot. Only those notes become its part; the slot is empty before import. They stay in this browser’s IndexedDB. The external recording plays outside the studio audio path and is excluded from WAV capture.'
          ],
          bullets: [
            'SOURCES / PRESET TYPE explains the selected material’s origin.',
            'Licences and source MIDI files are included in SOURCES.md and assets.',
            'Export important notes, sounds and sessions before clearing browser data.'
          ]
        }
      ]
    },
    {
      id: 'effects', tab: 'FX / NACHT', title: 'Space and the oscilloscope',
      summary: 'Effects, output level and reading the waveform.',
      pages: [
        {
          heading: 'Building a sense of space',
          paragraphs: [
            'CHAMBER adds a room tail. The synth and GRAV have separate sends into the shared stereo reverb: keep drums dry while moving a choir further away. ECHO / DELAY MIX controls the audible repeats; DELAY TIME sets their interval in seconds. CHORUS adds a slowly changing delay to broaden the sound.',
            'TONE darkens or opens the upper frequencies; PREAMP changes saturation and the dry signal level. These effects are included in WAV. MASTER adjusts the overall musical output and also affects the recording. The output compressor softens peaks but does not replace a careful balance between loud layers.'
          ],
          bullets: [
            'If the melody disappears, reduce CHAMBER and DELAY MIX.',
            'For muddy chords, shorten RELEASE or reduce low layers.',
            'A long tail after STOP comes from the effects rather than a held key.'
          ]
        },
        {
          heading: 'NACHT: seeing the sound',
          paragraphs: [
            'NACHT analyses the final stereo mix after effects and output processing. WAVEFORM shows amplitude changing over time. TIME / DIV sets the time scale; GAIN increases trace height only on the screen and does not make the music louder. HOLD freezes the picture while playback continues.',
            'SPECTRUM shows how energy is distributed across frequencies. A nearly pure tone has one main peak; brighter waves and noise add other components. The Hz and period T readings estimate the main periodicity. Chords, gongs, noise and strong reverb may not have a single clear pitch to report.'
          ],
          bullets: [
            'One complete repetition of the waveform is one oscillation period.',
            'Begin with one held note for a steadier display.',
            'The dB reading helps compare levels; it does not measure room loudness.',
            'Device feedback sounds use a separate output and leave NACHT’s musical signal unchanged.'
          ]
        }
      ]
    },
    {
      id: 'recording', tab: 'Saving', title: 'WAV, MIDI and sessions',
      summary: 'Three ways to keep the result and move your work.',
      pages: [
        {
          heading: 'Recording the audible result',
          paragraphs: [
            'Press ● Record WAV, then start the transport or play live. Recording captures the studio’s musical output after effects and the output compressor. It includes the synth, percussion and MASTER setting. No microphone is used. Button beeps, switches, the opening and external source player stay outside the musical recording.',
            'Press again to finish capture. Wait for the file to be prepared, then use “Download WAV” in the panel that appears. The format is stereo 16-bit PCM at the main audio context’s sample rate, usually 48 kHz. To keep the reverb ending, stop the music, wait for the tail, then finish recording.'
          ],
          bullets: [
            'The WAV timer includes all captured time, including pauses.',
            'A long take uses memory until the file has been prepared.',
            'For licensed scores, source information is added to WAV metadata.'
          ]
        },
        {
          heading: 'Keeping the work editable',
          paragraphs: [
            'SAVE SESSION downloads JSON containing the current sound, notes, drums, lengths, playback regions, tempo, effects, percussion kit and settings. LOAD restores it; older v1 sessions are supported too. This is the main way to move a project or recover it after clearing browser data. A WAV alone does not contain an editable arrangement.',
            'MIDI ↓ saves one device’s musical events; ALL MIDI ↓ saves notes and drums together. MIDI stores notes, timing and strength but does not automatically reproduce the PD sound and effects on another instrument. MIDI ↑ offers track selection, destination, file tempo and optional snapping to the grid.'
          ],
          bullets: [
            'MIDI type 0/1, sustain and converted tempo changes are supported.',
            'In “Both devices” mode, channel 10 goes to GRAV.',
            'Notes keep fractional timing; percussion snaps to 1/16 steps.',
            'WRITE stores only a sound in the browser; JSON keeps the whole studio.'
          ]
        }
      ]
    },
    {
      id: 'system', tab: 'System', title: 'Settings and steady playback',
      summary: 'Language, device feedback, performance and troubleshooting.',
      pages: [
        {
          heading: 'Settings and everyday use',
          paragraphs: [
            'Change language in this book or in settings. The interface and displayed preset names are translated; notes, sound parameters and source composition data stay unchanged. The replay-opening button returns to the beginning. “Device sounds” enables or disables the feedback clicks and beeps.',
            'Settings also contain MASTER, live-play VELOCITY, MIDI connection and the audio engine and base-latency status. Polyphony is on the synthesizer so the voice limit remains visible while playing. Open the book with the Help button beside the audio switch or after the opening.'
          ],
          bullets: [
            'Hold Shift for fine knob changes.',
            'Escape closes ordinary dialogs and releases live keys.',
            'Turn FOLLOW off to stop the editor returning to the current note.',
            'Saved files are more dependable than one tab’s or browser’s memory.'
          ]
        },
        {
          heading: 'If the audio breaks up',
          paragraphs: [
            'The main engine uses AudioWorklet, a compact WebAssembly kernel and preallocated voices. A JavaScript kernel works when WASM is unavailable. Notes and drums are timed in the audio thread; screen drawing does not trigger the next note. HTTPS and localhost support the main mode. Opening a file directly may select the compatible buffered mode.',
            'For crackles, check voice use, lower polyphony, shorten long RELEASE settings and close demanding tabs. For silence, check audio activation, POWER, MASTER, GRAV volume and the transport. If the browser suspended audio, press audio activation again. ALL NOTES OFF stops stuck notes so you can start afresh.'
          ],
          bullets: [
            'A high voice limit leaves room but requires more processing.',
            'Latency also depends on the browser, driver and audio device.',
            'This is an independent CZ-101 interpretation rather than an exact hardware circuit replica.',
            'Use your ears to check the final balance and effect tails.'
          ]
        }
      ]
    }
  ]
};
