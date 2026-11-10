export type Language = 'uzl' | 'uzc' | 'ru' | 'en' | 'uz-Latn' | 'uz-Cyrl';

export interface Translations {
  brand: {
    name: string;
    tagline: string;
    description: string;
  };
  nav: {
    dashboard: string;
    createPost: string;
    calendar: string;
    accounts: string;
    media: string;
    published: string;
    analytics: string;
    assistant: string;
    notifications: string;
    settings: string;
    studio: string;
    inbox: string;
    telegram: string;
    workflows: string;
    crm: string;
    productivity: string;
    team: string;
    billing: string;
    approvals: string;
    executions: string;
    agents: string;
    tasks: string;
    email: string;
    calendarEvents: string;
    documents: string;
    knowledge: string;
    business: string;
    security: string;
    auditLogs: string;
    admin: string;
    onboarding: string;
    meetings: string;
    usage: string;
  };
  common: {
    save: string;
    cancel: string;
    approve: string;
    reject: string;
    delete: string;
    edit: string;
    create: string;
    publish: string;
    schedule: string;
    connect: string;
    disconnect: string;
    status: string;
    loading: string;
    actions: string;
    search: string;
    filter: string;
    logout: string;
    back: string;
    refresh: string;
    copied: string;
    copyUrl: string;
    viewAll: string;
    details: string;
    close: string;
    retry: string;
  };
  dashboard: {
    title: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    heroBadge: string;
    createPostBtn: string;
    calendarBtn: string;
    connectedAccounts: string;
    activeChannelsText: string;
    scheduledPosts: string;
    scheduledNext48h: string;
    publishedPosts: string;
    publishedAll: string;
    totalAudience: string;
    audienceActivity: string;
    scheduledTitle: string;
    scheduledEmpty: string;
    planPostBtn: string;
    recentPublishedTitle: string;
    recentEmpty: string;
    createFirstPostBtn: string;
    securityTitle: string;
    securitySubtitle: string;
    manageAccountsBtn: string;
  };
  accounts: {
    title: string;
    subtitle: string;
    refreshBtn: string;
    coreSection: string;
    optionalSection: string;
    activeAccountsTitle: string;
    noAccountsTitle: string;
    noAccountsDesc: string;
    connectBtn: string;
    disconnectBtn: string;
    statusConnected: string;
    statusDisconnected: string;
    statusBlocked: string;
    approvalPending: string;
    partnerGated: string;
    tokenVaultProtected: string;
    telegramTitle: string;
    telegramDesc: string;
    instagramTitle: string;
    instagramDesc: string;
    youtubeTitle: string;
    youtubeDesc: string;
    tiktokTitle: string;
    tiktokDesc: string;
    linkedinTitle: string;
    linkedinDesc: string;
  };
  createPost: {
    pageTitle: string;
    pageSubtitle: string;
    destinationLabel: string;
    noChannelsLinked: string;
    linkChannelCta: string;
    titleLabel: string;
    titlePlaceholder: string;
    captionLabel: string;
    captionPlaceholder: string;
    charCount: string;
    hashtagsLabel: string;
    hashtagsPlaceholder: string;
    addBtn: string;
    mediaLabel: string;
    mediaPlaceholder: string;
    attachBtn: string;
    scheduleToggle: string;
    publishNowBtn: string;
    scheduleBtn: string;
    livePreviewTitle: string;
    previewPlaceholder: string;
    successPublish: string;
    successSchedule: string;
  };
  assistant: {
    copilotTitle: string;
    copilotSubtitle: string;
    initialGreeting: string;
    inputPlaceholder: string;
    sendBtn: string;
    actionApproved: string;
    unconfiguredNotice: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    fullNameLabel: string;
    orgNameLabel: string;
    loginBtn: string;
    registerBtn: string;
    googleBtn: string;
    forgotPasswordLink: string;
    noAccount: string;
    haveAccount: string;
    invalidCredentials: string;
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    newPasswordLabel: string;
    saveNewPasswordBtn: string;
    verifyEmailTitle: string;
    verifyEmailSubtitle: string;
    verifyBtn: string;
    resendBtn: string;
  };
  autonomy: {
    advisor: string;
    creator: string;
    operator: string;
    autopilot: string;
  };
  landing: {
    navFeatures: string;
    navPlatforms: string;
    navSecurity: string;
    heroBadge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    goToDashboard: string;
    createFirstPost: string;
    platformsTitle: string;
    platformsSubtitle: string;
    featuresTitle: string;
    featuresSubtitle: string;
    securityBadge: string;
    securityTitle: string;
    securitySubtitle: string;
    createAccountCta: string;
  };
}

// 1. Uzbek Latin (Default)
const uzlTranslations: Translations = {
  brand: {
    name: "NovaSphere AI",
    tagline: "Ijtimoiy tarmoqlarni boshqarish va nashr qilish platformasi",
    description: "Instagram, Telegram va YouTube kanallaringizni bitta joydan qulay boshqaring.",
  },
  nav: {
    dashboard: "Boshqaruv paneli",
    createPost: "Post Yaratish",
    calendar: "Nashrlar taqvimi",
    accounts: "Ijtimoiy tarmoqlar",
    media: "Media kutubxona",
    published: "Chiqarilgan postlar",
    analytics: "Tahlil va Statistika",
    assistant: "AI Yordamchi",
    notifications: "Bildirishnomalar",
    settings: "Sozlamalar",
    studio: "Kontent studiyasi",
    inbox: "Yagona Inbox",
    telegram: "Telegram markazi",
    workflows: "Avtomatlashtirish",
    crm: "Biznes CRM",
    productivity: "Shaxsiy unumdorlik",
    team: "Jamoa a'zolari",
    billing: "Obuna va to'lovlar",
    approvals: "Tasdiqlash markazi",
    executions: "AI amallar tarixi",
    agents: "Agentlar Markazi",
    tasks: "Vazifalar doskasi",
    email: "Email pochta",
    calendarEvents: "Uchrashuvlar taqvimi",
    documents: "Hujjatlar tahlili",
    knowledge: "Bilimlar bazasi",
    business: "Biznes tahlilchi",
    security: "Xavfsizlik markazi",
    auditLogs: "Audit jurnali",
    admin: "Super Admin",
    onboarding: "Tezkor boshlash",
    meetings: "Uchrashuvlar tahlili",
    usage: "Sarflangan limitlar",
  },
  common: {
    save: "Saqlash",
    cancel: "Bekor qilish",
    approve: "Tasdiqlash",
    reject: "Rad etish",
    delete: "O'chirish",
    edit: "Tahrirlash",
    create: "Yaratish",
    publish: "Chiqarish",
    schedule: "Rejalashtirish",
    connect: "Ulash",
    disconnect: "Uzish",
    status: "Holat",
    loading: "Yuklanmoqda...",
    actions: "Amallar",
    search: "Qidirish...",
    filter: "Filtr",
    logout: "Chiqish",
    back: "Orqaga",
    refresh: "Yangilash",
    copied: "Nusxalandi",
    copyUrl: "URL nusxalash",
    viewAll: "Barchasini ko'rish",
    details: "Tafsilotlar",
    close: "Yopish",
    retry: "Qayta urinish",
  },
  dashboard: {
    title: "Boshqaruv paneli",
    welcomeTitle: "Ijtimoiy tarmoqlaringizni bir joydan boshqaring",
    welcomeSubtitle: "Instagram, Telegram va YouTube kanallaringiz uchun postlar yarating, AI yordamida matnlar yozing va avtomatik reja bo'yicha e'lon qiling.",
    heroBadge: "Yagona Boshqaruv Markazi",
    createPostBtn: "Post Yaratish",
    calendarBtn: "Nashrlar taqvimi",
    connectedAccounts: "Ulangan hisoblar",
    activeChannelsText: "faol kanal",
    scheduledPosts: "Navbatda (48s)",
    scheduledNext48h: "Yaqin nashrlar",
    publishedPosts: "Chiqarildi",
    publishedAll: "Barcha tarmoqlarda",
    totalAudience: "Auditoriya",
    audienceActivity: "faollik darajasi",
    scheduledTitle: "Yaqin 48 soat ichida rejalashtirilgan",
    scheduledEmpty: "Yaqin 48 soat uchun rejalashtirilgan postlar yo'q",
    planPostBtn: "+ Post rejalashtirish",
    recentPublishedTitle: "Yaqinda chiqarilgan postlar",
    recentEmpty: "Hozircha chiqarilgan postlar yo'q",
    createFirstPostBtn: "+ Birinchi postni yaratish",
    securityTitle: "Integratsiyalar holati va xavfsizlik",
    securitySubtitle: "Barcha tokenlar apparat darajasidagi AES-256-GCM shifrlash bilan himoyalangan.",
    manageAccountsBtn: "Akkauntlarni boshqarish",
  },
  accounts: {
    title: "Ulangan Ijtimoiy Tarmoqlar",
    subtitle: "Instagram, Telegram va YouTube kanallaringizni rasmiy API orqali xavfsiz boshqaring.",
    refreshBtn: "Yangilash",
    coreSection: "Asosiy integratsiyalar (Core)",
    optionalSection: "Qo'shimcha platformalar (Optional)",
    activeAccountsTitle: "Faol ulangan akkauntlar",
    noAccountsTitle: "Hozircha ulangan akkauntlar yo'q",
    noAccountsDesc: "Yuqoridagi tugmalardan birini bosing va Instagram, Telegram yoki YouTube akkauntingizni ulang.",
    connectBtn: "Ulash",
    disconnectBtn: "Uzish",
    statusConnected: "Ulangan",
    statusDisconnected: "Ulanmagan",
    statusBlocked: "Tasdiqlash kutilmoqda",
    approvalPending: "Approval Pending",
    partnerGated: "Partner Gated",
    tokenVaultProtected: "AES-256 Token Vault bilan himoyalangan",
    telegramTitle: "Telegram Bot & Kanallar",
    telegramDesc: "Kanal va guruhlarga xabarlar, rasmlar va media albomlarni darhol yoki reja bo'yicha chiqarish.",
    instagramTitle: "Instagram Professional",
    instagramDesc: "Biznes akkauntlar uchun postlar, karusellar va Reels chiqarish (Meta Graph API).",
    youtubeTitle: "YouTube Creator Channel",
    youtubeDesc: "YouTube Data API v3 orqali video va Shorts yuklash, tavsif va teglar qo'shish.",
    tiktokTitle: "TikTok Content Posting API",
    tiktokDesc: "TikTok Developer tijoriy sheriklik tasdig'idan keyin faollashadi.",
    linkedinTitle: "LinkedIn Community Management",
    linkedinDesc: "Kompaniya sahifalariga nashr qilish uchun tasdiqlangan partner ruxsati talab etiladi.",
  },
  createPost: {
    pageTitle: "Post Yaratish",
    pageSubtitle: "Bir marta yozing, moslashtiring va barcha tarmoqlarga birdaniga chiqaring.",
    destinationLabel: "Qayerga chiqarilsin? (Kanallarni tanlang)",
    noChannelsLinked: "Hozircha ulangan kanallar yo'q.",
    linkChannelCta: "Kanal ulash ->",
    titleLabel: "Sarlavha (Ixtiyoriy yoki YouTube uchun)",
    titlePlaceholder: "Masalan: Yangi mahsulot taqdimoti",
    captionLabel: "Post Matni (Caption)",
    captionPlaceholder: "Post matnini bu yerga yozing yoki AI Yordamchi orqali yarating...",
    charCount: "belgi",
    hashtagsLabel: "Hashtaglar",
    hashtagsPlaceholder: "masalan: yangilik, marketing",
    addBtn: "Qo'shish",
    mediaLabel: "Rasm yoki Video Havolalari",
    mediaPlaceholder: "https://... yoki Media Kutubxonadan tanlang",
    attachBtn: "Biriktirish",
    scheduleToggle: "Kechiktirib chiqarish (Rejalashtirish)",
    publishNowBtn: "Hozir Chiqarish (Publish Now)",
    scheduleBtn: "Rejalashtirish (Schedule)",
    livePreviewTitle: "Jonli Ko'rinish (Live Preview)",
    previewPlaceholder: "Sizning post matningiz bu yerda ko'rinadi...",
    successPublish: "Post tanlangan barcha kanallarga muvaffaqiyatli chiqarildi!",
    successSchedule: "Post belgilangan vaqtga rejalashtirildi!",
  },
  assistant: {
    copilotTitle: "NovaSphere AI Yordamchi",
    copilotSubtitle: "Ijtimoiy tarmoqlar uchun avtonom kontent va matn yordamchisi",
    initialGreeting: "Assalomu alaykum! Men NovaSphere AI yordamchisiman. Menga Instagram, Telegram yoki YouTube uchun post matnlari yaratish, heshteglar topish yoki nashr rejasini tuzish bo'yicha buyruq bering.",
    inputPlaceholder: "Buyruq kiriting (masalan: 'Yangi mahsulot uchun Telegram va Instagramga jozibali post yozib ber')...",
    sendBtn: "Yuborish",
    actionApproved: "Amal tasdiqlandi va ijroga yuborildi.",
    unconfiguredNotice: "AI provayder kaliti sozlanmagan. Iltimos, Sozlamalar bo'limida GEMINI_API_KEY yoki OPENAI_API_KEY ni kiriting.",
  },
  auth: {
    loginTitle: "Xush kelibsiz",
    loginSubtitle: "NovaSphere AI ish maydoniga kiring",
    registerTitle: "Yangi hisob yaratish",
    registerSubtitle: "Ijtimoiy tarmoqlaringizni professional boshqarishni boshlang",
    emailLabel: "Ishchi Email",
    passwordLabel: "Maxfiy parol",
    fullNameLabel: "To'liq ism-sharif",
    orgNameLabel: "Ish maydoni / Tashkilot nomi",
    loginBtn: "Tizimga kirish",
    registerBtn: "Bepul hisob ochish",
    googleBtn: "Google orqali kirish",
    forgotPasswordLink: "Parolni unutdingizmi?",
    noAccount: "Hisobingiz yo'qmi?",
    haveAccount: "Hisobingiz bormi?",
    invalidCredentials: "Email yoki parol noto'g'ri",
    resetPasswordTitle: "Parolni tiklash",
    resetPasswordSubtitle: "Yangi xavfsiz parolingizni kiriting",
    newPasswordLabel: "Yangi maxfiy parol",
    saveNewPasswordBtn: "Parolni yangilash",
    verifyEmailTitle: "Emailingizni tasdiqlang",
    verifyEmailSubtitle: "Poctangizga yuborilgan 6 xonali tasdiqlash kodini kiriting",
    verifyBtn: "Tasdiqlash",
    resendBtn: "Qayta yuborish",
  },
  autonomy: {
    advisor: "Maslahatchi (Advisor)",
    creator: "Ijodkor (Creator)",
    operator: "Operator",
    autopilot: "Avtopilot (Autopilot)",
  },
  landing: {
    navFeatures: "Imkoniyatlar",
    navPlatforms: "Tarmoqlar",
    navSecurity: "Xavfsizlik",
    heroBadge: "Ijtimoiy tarmoqlar uchun aqlli boshqaruv va nashr tizimi",
    heroTitle1: "Barcha Ijtimoiy Tarmoqlaringizni",
    heroTitle2: "Yagona Joydan Boshqaring",
    heroSubtitle: "Instagram, Telegram va YouTube kanallaringizga bitta tugma orqali post chiqaring, rejalashtiring, AI yordamida jozibali matnlar yozing va barcha faollikni nazorat qiling.",
    goToDashboard: "Boshqaruv Paneliga O'tish",
    createFirstPost: "Birinchi Postni Yaratish",
    platformsTitle: "Rasmiy API Integratsiyalari",
    platformsSubtitle: "Hech qanday soxta simulyatsiyalarsiz — platforma bevosita rasmiy tarmoq APIlari orqali ishlaydi.",
    featuresTitle: "Ijtimoiy Tarmoqlar Uchun Barcha Asboblar",
    featuresSubtitle: "Kundalik marketing va post chiqarish jarayonini tez, qulay va sodda qiling.",
    securityBadge: "AES-256-GCM Token Vault",
    securityTitle: "Ijtimoiy Tarmoq Tokenlaringiz To'liq Himoyalangan",
    securitySubtitle: "Har bir kanal va bot maxfiy kaliti alohida IV va 256-bitli shifrlash bilan ma'lumotlar bazasida xavfsiz saqlanadi.",
    createAccountCta: "Hisob Yaratish",
  },
};

// 2. Uzbek Cyrillic
const uzcTranslations: Translations = {
  brand: {
    name: "NovaSphere AI",
    tagline: "Ижтимоий тармоқларни бошқариш ва нашр қилиш платформаси",
    description: "Instagram, Telegram ва YouTube каналларингизни битта жойдан қулай бошқаринг.",
  },
  nav: {
    dashboard: "Бошқарув панели",
    createPost: "Пост Яратиш",
    calendar: "Нашрлар тақвими",
    accounts: "Ижтимоий тармоқлар",
    media: "Медиа кутубхона",
    published: "Чиқарилган постлар",
    analytics: "Таҳлил ва Статистика",
    assistant: "АИ Ёрдамчи",
    notifications: "Билдиришномалар",
    settings: "Созламалар",
    studio: "Контент студияси",
    inbox: "Ягона Инбох",
    telegram: "Телеграм маркази",
    workflows: "Автоматлаштириш",
    crm: "Бизнес CРМ",
    productivity: "Шахсий унумдорлик",
    team: "Жамоа аъзолари",
    billing: "Обуна ва тўловлар",
    approvals: "Тасдиқлаш маркази",
    executions: "АИ амаллар тарихи",
    agents: "Агентлар Маркази",
    tasks: "Вазифалар доскаси",
    email: "Емаил почта",
    calendarEvents: "Учрашувлар тақвими",
    documents: "Ҳужжатлар таҳлили",
    knowledge: "Билимлар базаси",
    business: "Бизнес таҳлилчи",
    security: "Хавфсизлик маркази",
    auditLogs: "Аудит журнали",
    admin: "Супер Админ",
    onboarding: "Тезкор бошлаш",
    meetings: "Учрашувлар таҳлили",
    usage: "Сарфланган лимитлар",
  },
  common: {
    save: "Сақлаш",
    cancel: "Бекор қилиш",
    approve: "Тасдиқлаш",
    reject: "Рад этиш",
    delete: "Ўчириш",
    edit: "Таҳрирлаш",
    create: "Яратиш",
    publish: "Чиқариш",
    schedule: "Режалаштириш",
    connect: "Улаш",
    disconnect: "Узиш",
    status: "Ҳолат",
    loading: "Юкланмоқда...",
    actions: "Амаллар",
    search: "Қидириш...",
    filter: "Филтр",
    logout: "Чиқиш",
    back: "Орқага",
    refresh: "Янгилаш",
    copied: "Нусхаланди",
    copyUrl: "URL нусхалаш",
    viewAll: "Барчасини кўриш",
    details: "Тафсилотлар",
    close: "Ёпиш",
    retry: "Қайта уриниш",
  },
  dashboard: {
    title: "Бошқарув панели",
    welcomeTitle: "Ижтимоий тармоқларингизни бир жойдан бошқаринг",
    welcomeSubtitle: "Instagram, Telegram ва YouTube каналларингиз учун постлар яратинг, АИ ёрдамида матнлар ёзинг ва автоматик режа бўйича эълон қилинг.",
    heroBadge: "Ягона Бошқарув Маркази",
    createPostBtn: "Пост Яратиш",
    calendarBtn: "Нашрлар тақвими",
    connectedAccounts: "Уланган ҳисоблар",
    activeChannelsText: "фаол канал",
    scheduledPosts: "Навбатда (48с)",
    scheduledNext48h: "Яқин нашрлар",
    publishedPosts: "Чиқарилди",
    publishedAll: "Барча тармоқларда",
    totalAudience: "Аудитория",
    audienceActivity: "фаоллик даражаси",
    scheduledTitle: "Яқин 48 соат ичида режалаштирилган",
    scheduledEmpty: "Яқин 48 соат учун режалаштирилган постлар йўқ",
    planPostBtn: "+ Пост режалаштириш",
    recentPublishedTitle: "Яқинда чиқарилган постлар",
    recentEmpty: "Ҳозирча чиқарилган постлар йўқ",
    createFirstPostBtn: "+ Биринчи постни яратиш",
    securityTitle: "Интеграциялар ҳолати ва хавфсизлик",
    securitySubtitle: "Барча токенлар аппарат даражасидаги AES-256-GCM шифрлаш билан ҳимояланган.",
    manageAccountsBtn: "Аккаунтларни бошқариш",
  },
  accounts: {
    title: "Уланган Ижтимоий Тармоқлар",
    subtitle: "Instagram, Telegram ва YouTube каналларингизни расмий API орқали хавфсиз бошқаринг.",
    refreshBtn: "Янгилаш",
    coreSection: "Асосий интеграциялар (Core)",
    optionalSection: "Қўшимча платформалар (Optional)",
    activeAccountsTitle: "Фаол уланган аккаунтлар",
    noAccountsTitle: "Ҳозирча уланган аккаунтлар йўқ",
    noAccountsDesc: "Юқоридаги тугмалардан бирини босинг ва Instagram, Telegram ёки YouTube аккаунтингизни уланг.",
    connectBtn: "Улаш",
    disconnectBtn: "Узиш",
    statusConnected: "Уланган",
    statusDisconnected: "Уланмаган",
    statusBlocked: "Тасдиқлаш кутилмоқда",
    approvalPending: "Approval Pending",
    partnerGated: "Partner Gated",
    tokenVaultProtected: "AES-256 Token Vault билан ҳимояланган",
    telegramTitle: "Telegram Bot & Каналлар",
    telegramDesc: "Канал ва гуруҳларга хабарлар, расмлар ва медиа альбомларни дарҳол ёки режа бўйича чиқариш.",
    instagramTitle: "Instagram Professional",
    instagramDesc: "Бизнес аккаунтлар учун постлар, каруселлар ва Reels чиқариш (Meta Graph API).",
    youtubeTitle: "YouTube Creator Channel",
    youtubeDesc: "YouTube Data API v3 орқали видео ва Shorts юклаш, тавсиф ва теглар қўшиш.",
    tiktokTitle: "TikTok Content Posting API",
    tiktokDesc: "TikTok Developer тижорий шериклик тасдиғидан кейин фаоллашади.",
    linkedinTitle: "LinkedIn Community Management",
    linkedinDesc: "Компания саҳифаларига нашр қилиш учун тасдиқланган партнер рухсати талаб этилади.",
  },
  createPost: {
    pageTitle: "Пост Яратиш",
    pageSubtitle: "Бир марта ёзинг, мослаштиринг ва барча тармоқларга бирданига чиқаринг.",
    destinationLabel: "Қаерга чиқарилсин? (Каналларни танланг)",
    noChannelsLinked: "Ҳозирча уланган каналлар йўқ.",
    linkChannelCta: "Канал улаш ->",
    titleLabel: "Сарлавҳа (Ихтиёрий ёки YouTube учун)",
    titlePlaceholder: "Масалан: Янги маҳсулот тақдимоти",
    captionLabel: "Пост Матни (Caption)",
    captionPlaceholder: "Пост матнини бу ерга ёзинг ёки АИ Ёрдамчи орқали яратинг...",
    charCount: "белги",
    hashtagsLabel: "Ҳэштеглар",
    hashtagsPlaceholder: "масалан: янгилик, маркетинг",
    addBtn: "Қўшиш",
    mediaLabel: "Расм ёки Видео Ҳаволалари",
    mediaPlaceholder: "https://... ёки Медиа кутубхонадан танланг",
    attachBtn: "Бириктириш",
    scheduleToggle: "Кечиктириб чиқариш (Режалаштириш)",
    publishNowBtn: "Ҳозир Чиқариш (Publish Now)",
    scheduleBtn: "Режалаштириш (Schedule)",
    livePreviewTitle: "Жонли Кўриниш (Live Preview)",
    previewPlaceholder: "Сизнинг пост матнингиз бу ерда кўринади...",
    successPublish: "Пост танланган барча каналларга муваффақиятли чиқарилди!",
    successSchedule: "Пост белгиланган вақтга режалаштирилди!",
  },
  assistant: {
    copilotTitle: "NovaSphere АИ Ёрдамчи",
    copilotSubtitle: "Ижтимоий тармоқлар учун автоном контент ва матн ёрдамчиси",
    initialGreeting: "Ассалому алайкум! Мен NovaSphere AI ёрдамчисиман. Менга Instagram, Telegram ёки YouTube учун пост матнлари яратиш, ҳэштеглар топиш ёки нашр режасини тузиш бўйича буйруқ беринг.",
    inputPlaceholder: "Буйруқ киритинг (масалан: 'Янги маҳсулот учун Telegram ва Instagramга жозибали пост ёзиб бер')...",
    sendBtn: "Юбориш",
    actionApproved: "Амал тасдиқланди ва ижрога юборилди.",
    unconfiguredNotice: "АИ провайдер калити созланмаган. Илтимос, Созламалар бўлимида GEMINI_API_KEY ёки OPENAI_API_KEY ни киритинг.",
  },
  auth: {
    loginTitle: "Хуш келибсиз",
    loginSubtitle: "NovaSphere AI иш майдонига киринг",
    registerTitle: "Янги ҳисоб яратиш",
    registerSubtitle: "Ижтимоий тармоқларингизни профессионал бошқаришни бошланг",
    emailLabel: "Ишчи Email",
    passwordLabel: "Махфий парол",
    fullNameLabel: "Тўлиқ исм-шариф",
    orgNameLabel: "Иш майдони / Ташкилот номи",
    loginBtn: "Тизимга кириш",
    registerBtn: "Бепул ҳисоб очиш",
    googleBtn: "Google орқали кириш",
    forgotPasswordLink: "Паролни унутдингизми?",
    noAccount: "Ҳисобингиз йўқми?",
    haveAccount: "Ҳисобингиз борми?",
    invalidCredentials: "Email ёки парол нотўғри",
    resetPasswordTitle: "Паролни тиклаш",
    resetPasswordSubtitle: "Янги хавфсиз паролингизни киритинг",
    newPasswordLabel: "Янги махфий парол",
    saveNewPasswordBtn: "Паролни янгилаш",
    verifyEmailTitle: "Emailингизни тасдиқланг",
    verifyEmailSubtitle: "Почтангизга юборилган 6 хонали тасдиқлаш кодини киритинг",
    verifyBtn: "Тасдиқлаш",
    resendBtn: "Қайта юбориш",
  },
  autonomy: {
    advisor: "Маслаҳатчи (Advisor)",
    creator: "Ижодкор (Creator)",
    operator: "Оператор",
    autopilot: "Автопилот (Autopilot)",
  },
  landing: {
    navFeatures: "Имкониятлар",
    navPlatforms: "Тармоқлар",
    navSecurity: "Хавфсизлик",
    heroBadge: "Ижтимоий тармоқлар учун ақлли бошқарув ва нашр тизими",
    heroTitle1: "Барча Ижтимоий Тармоқларингизни",
    heroTitle2: "Ягона Жойдан Бошқаринг",
    heroSubtitle: "Instagram, Telegram ва YouTube каналларингизга битта тугма орқали пост чиқаринг, режалаштиринг, AI ёрдамида жозибали матнлар ёзинг ва барча фаолликни назорат қилинг.",
    goToDashboard: "Бошқарув Панелига Ўтиш",
    createFirstPost: "Биринчи Постни Яратиш",
    platformsTitle: "Расмий API Интеграциялари",
    platformsSubtitle: "Ҳеч қандай сохта симуляцияларсиз — платформа бевосита расмий тармоқ APIлари орқали ишлайди.",
    featuresTitle: "Ижтимоий Тармоқлар Учун Барча Асбоблар",
    featuresSubtitle: "Кундалик маркетинг ва пост чиқариш жараёнини тез, қулай ва содда қилинг.",
    securityBadge: "AES-256-GCM Token Vault",
    securityTitle: "Ижтимоий Тармоқ Токенларингиз Тўлиқ Ҳимояланган",
    securitySubtitle: "Ҳар бир канал ва бот махфий калити алоҳида IV ва 256-битли шифрлаш билан маълумотлар базасида хавфсиз сақланади.",
    createAccountCta: "Ҳисоб Яратиш",
  },
};

// 3. Russian
const ruTranslations: Translations = {
  brand: {
    name: "NovaSphere AI",
    tagline: "Платформа управления и публикации в социальных сетях",
    description: "Публикуйте контент в Instagram, Telegram и YouTube из единого приложения.",
  },
  nav: {
    dashboard: "Панель управления",
    createPost: "Создать публикацию",
    calendar: "Календарь публикаций",
    accounts: "Соцсети и каналы",
    media: "Медиатека",
    published: "История публикаций",
    analytics: "Аналитика и статистика",
    assistant: "ИИ-Ассистент",
    notifications: "Уведомления",
    settings: "Настройки",
    studio: "Студия контента",
    inbox: "Единый Inbox",
    telegram: "Центр Telegram",
    workflows: "Автоматизации",
    crm: "Бизнес CRM",
    productivity: "Продуктивность",
    team: "Команда",
    billing: "Тарифы и оплата",
    approvals: "Центр утверждений",
    executions: "Логи запусков ИИ",
    agents: "Центр Агентов",
    tasks: "Задачи",
    email: "Электронная почта",
    calendarEvents: "Встречи и звонки",
    documents: "Анализ документов",
    knowledge: "База знаний",
    business: "Бизнес-ассистент",
    security: "Центр безопасности",
    auditLogs: "Журнал аудита",
    admin: "Панель администратора",
    onboarding: "Быстрый старт",
    meetings: "Анализ встреч",
    usage: "Использование и расходы",
  },
  common: {
    save: "Сохранить",
    cancel: "Отмена",
    approve: "Утвердить",
    reject: "Отклонить",
    delete: "Удалить",
    edit: "Редактировать",
    create: "Создать",
    publish: "Опубликовать",
    schedule: "Запланировать",
    connect: "Подключить",
    disconnect: "Отключить",
    status: "Статус",
    loading: "Загрузка...",
    actions: "Действия",
    search: "Поиск...",
    filter: "Фильтр",
    logout: "Выйти",
    back: "Назад",
    refresh: "Обновить",
    copied: "Скопировано",
    copyUrl: "Скопировать URL",
    viewAll: "Посмотреть все",
    details: "Подробности",
    close: "Закрыть",
    retry: "Повторить попытку",
  },
  dashboard: {
    title: "Панель управления",
    welcomeTitle: "Управляйте соцсетями из единого приложения",
    welcomeSubtitle: "Создавайте контент для Instagram, Telegram и YouTube с помощью ИИ и публикуйте по расписанию.",
    heroBadge: "Единый центр управления",
    createPostBtn: "Создать публикацию",
    calendarBtn: "Календарь публикаций",
    connectedAccounts: "Подключено аккаунтов",
    activeChannelsText: "активных каналов",
    scheduledPosts: "В очереди (48ч)",
    scheduledNext48h: "Ближайшие публикации",
    publishedPosts: "Опубликовано",
    publishedAll: "Во всех соцсетях",
    totalAudience: "Аудитория",
    audienceActivity: "активность",
    scheduledTitle: "Запланировано на 48 часов",
    scheduledEmpty: "Нет запланированных постов на ближайшие 48 часов",
    planPostBtn: "+ Запланировать пост",
    recentPublishedTitle: "Недавно опубликованные",
    recentEmpty: "Пока нет опубликованных постов",
    createFirstPostBtn: "+ Создать первый пост",
    securityTitle: "Статус интеграций и безопасность",
    securitySubtitle: "Все токены защищены аппаратным шифрованием AES-256-GCM.",
    manageAccountsBtn: "Управление аккаунтами",
  },
  accounts: {
    title: "Подключенные социальные сети",
    subtitle: "Управление официальными интеграциями Instagram, Telegram и YouTube через защищенный Token Vault.",
    refreshBtn: "Обновить",
    coreSection: "Основные интеграции (Core)",
    optionalSection: "Дополнительные платформы (Optional)",
    activeAccountsTitle: "Активные подключенные аккаунты",
    noAccountsTitle: "Пока нет подключенных аккаунтов",
    noAccountsDesc: "Нажмите кнопку выше, чтобы подключить Instagram, Telegram или YouTube.",
    connectBtn: "Подключить",
    disconnectBtn: "Отключить",
    statusConnected: "Подключено",
    statusDisconnected: "Не подключено",
    statusBlocked: "Ожидает одобрения",
    approvalPending: "Approval Pending",
    partnerGated: "Partner Gated",
    tokenVaultProtected: "Защищено AES-256 Token Vault",
    telegramTitle: "Telegram Bot & Каналы",
    telegramDesc: "Мгновенные публикации в каналы и группы через собственного бота @BotFather с поддержкой форматирования.",
    instagramTitle: "Instagram Professional",
    instagramDesc: "Публикация постов, каруселей и Reels в бизнес-аккаунты через официальный Meta Graph API.",
    youtubeTitle: "YouTube Creator Channel",
    youtubeDesc: "Загрузка видео и Shorts через YouTube Data API v3 с настройкой заголовков, тегов и приватности.",
    tiktokTitle: "TikTok Content Posting API",
    tiktokDesc: "Ожидает одобрения коммерческого партнерства TikTok Developer.",
    linkedinTitle: "LinkedIn Community Management",
    linkedinDesc: "Требуется подтвержденный доступ партнера LinkedIn Developer для публикации на страницах компаний.",
  },
  createPost: {
    pageTitle: "Создать публикацию",
    pageSubtitle: "Напишите один раз, настройте и опубликуйте во все каналы одновременно.",
    destinationLabel: "Куда опубликовать? (Выберите каналы)",
    noChannelsLinked: "Пока нет подключенных каналов.",
    linkChannelCta: "Подключить канал ->",
    titleLabel: "Заголовок (Опционально или для YouTube)",
    titlePlaceholder: "Например: Презентация нового продукта",
    captionLabel: "Текст публикации (Caption)",
    captionPlaceholder: "Введите текст поста или сгенерируйте с помощью ИИ...",
    charCount: "символов",
    hashtagsLabel: "Хэштеги",
    hashtagsPlaceholder: "например: новости, маркетинг",
    addBtn: "Добавить",
    mediaLabel: "Ссылки на фото или видео",
    mediaPlaceholder: "https://... или выберите из медиатеки",
    attachBtn: "Прикрепить",
    scheduleToggle: "Отложенная публикация (Расписание)",
    publishNowBtn: "Опубликовать сейчас (Publish Now)",
    scheduleBtn: "Запланировать (Schedule)",
    livePreviewTitle: "Предпросмотр (Live Preview)",
    previewPlaceholder: "Текст вашего поста появится здесь...",
    successPublish: "Пост успешно отправлен во все выбранные каналы!",
    successSchedule: "Публикация запланирована на выбранное время!",
  },
  assistant: {
    copilotTitle: "NovaSphere ИИ-Ассистент",
    copilotSubtitle: "Автономный помощник по созданию контента для соцсетей",
    initialGreeting: "Здравствуйте! Я ассистент NovaSphere AI. Напишите мне задачу: написать привлекательный пост, подобрать хэштеги или составить контент-план для ваших соцсетей.",
    inputPlaceholder: "Введите поручение (например: 'Напиши вовлекающий пост для Telegram и Instagram про акцию')...",
    sendBtn: "Отправить",
    actionApproved: "Действие утверждено и отправлено на исполнение.",
    unconfiguredNotice: "Ключ AI-провайдера не настроен. Пожалуйста, укажите GEMINI_API_KEY или OPENAI_API_KEY в Настройках.",
  },
  auth: {
    loginTitle: "С возвращением",
    loginSubtitle: "Войдите в рабочее пространство NovaSphere AI",
    registerTitle: "Регистрация аккаунта",
    registerSubtitle: "Начните профессионально управлять своими соцсетями",
    emailLabel: "Рабочий Email",
    passwordLabel: "Пароль",
    fullNameLabel: "Полное имя",
    orgNameLabel: "Название организации",
    loginBtn: "Войти",
    registerBtn: "Создать аккаунт",
    googleBtn: "Войти через Google",
    forgotPasswordLink: "Забыли пароль?",
    noAccount: "Еще нет аккаунта?",
    haveAccount: "Уже зарегистрированы?",
    invalidCredentials: "Неверный адрес электронной почты или пароль",
    resetPasswordTitle: "Восстановление пароля",
    resetPasswordSubtitle: "Введите ваш новый надежный пароль",
    newPasswordLabel: "Новый пароль",
    saveNewPasswordBtn: "Сохранить новый пароль",
    verifyEmailTitle: "Подтверждение Email",
    verifyEmailSubtitle: "Введите 6-значный код подтверждения, отправленный на вашу почту",
    verifyBtn: "Подтвердить",
    resendBtn: "Отправить повторно",
  },
  autonomy: {
    advisor: "Советник (Advisor)",
    creator: "Создатель (Creator)",
    operator: "Оператор",
    autopilot: "Автопилот (Autopilot)",
  },
  landing: {
    navFeatures: "Возможности",
    navPlatforms: "Платформы",
    navSecurity: "Безопасность",
    heroBadge: "Умная система управления и публикации в соцсетях",
    heroTitle1: "Управляйте Всеми Соцсетями",
    heroTitle2: "Из Единого Центра",
    heroSubtitle: "Публикуйте контент в Instagram, Telegram и YouTube в один клик, планируйте публикации в календаре и создавайте вирусные посты с помощью ИИ.",
    goToDashboard: "Панель управления",
    createFirstPost: "Создать первый пост",
    platformsTitle: "Официальные API Интеграции",
    platformsSubtitle: "Никаких эмуляций — платформа работает напрямую через официальные API социальных сетей.",
    featuresTitle: "Все Инструменты для Соцсетей",
    featuresSubtitle: "Сделайте ежедневный маркетинг и постинг быстрым, простым и эффективным.",
    securityBadge: "AES-256-GCM Token Vault",
    securityTitle: "Ваши Токены Полностью Защищены",
    securitySubtitle: "Ключи ботов и аккаунтов шифруются надежным алгоритмом AES-256-GCM с уникальным вектором инициализации.",
    createAccountCta: "Создать аккаунт",
  },
};

// 4. English
const enTranslations: Translations = {
  brand: {
    name: "NovaSphere AI",
    tagline: "Social Media Management & Publishing Platform",
    description: "Manage, create, and publish content across Instagram, Telegram, and YouTube from one place.",
  },
  nav: {
    dashboard: "Dashboard",
    createPost: "Create Post",
    calendar: "Content Calendar",
    accounts: "Connected Accounts",
    media: "Media Library",
    published: "Published Posts",
    analytics: "Analytics & Reports",
    assistant: "AI Assistant",
    notifications: "Notifications",
    settings: "Settings",
    studio: "Content Studio",
    inbox: "Unified Inbox",
    telegram: "Telegram Hub",
    workflows: "Automations",
    crm: "Business CRM",
    productivity: "Productivity",
    team: "Team Members",
    billing: "Billing & Plans",
    approvals: "Approval Center",
    executions: "AI Execution Logs",
    agents: "Agent Center",
    tasks: "Tasks",
    email: "Email Inbox",
    calendarEvents: "Meetings Calendar",
    documents: "Document Analysis",
    knowledge: "Knowledge Base",
    business: "Business Advisor",
    security: "Security Center",
    auditLogs: "Audit Logs",
    admin: "Super Admin",
    onboarding: "Quick Start",
    meetings: "Meeting Notes",
    usage: "Usage & Limits",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    publish: "Publish",
    schedule: "Schedule",
    connect: "Connect",
    disconnect: "Disconnect",
    status: "Status",
    loading: "Loading...",
    actions: "Actions",
    search: "Search...",
    filter: "Filter",
    logout: "Sign Out",
    back: "Back",
    refresh: "Refresh",
    copied: "Copied",
    copyUrl: "Copy URL",
    viewAll: "View All",
    details: "Details",
    close: "Close",
    retry: "Retry",
  },
  dashboard: {
    title: "Dashboard",
    welcomeTitle: "Manage Your Social Media in One Place",
    welcomeSubtitle: "Create, schedule, and publish content across Instagram, Telegram, and YouTube with native AI assistance.",
    heroBadge: "Unified Management Hub",
    createPostBtn: "Create Post",
    calendarBtn: "Content Calendar",
    connectedAccounts: "Connected Accounts",
    activeChannelsText: "active channels",
    scheduledPosts: "In Queue (48h)",
    scheduledNext48h: "Upcoming Posts",
    publishedPosts: "Published",
    publishedAll: "Across all networks",
    totalAudience: "Total Audience",
    audienceActivity: "engagement level",
    scheduledTitle: "Scheduled for next 48 hours",
    scheduledEmpty: "No posts scheduled for the next 48 hours",
    planPostBtn: "+ Schedule Post",
    recentPublishedTitle: "Recently Published",
    recentEmpty: "No published posts yet",
    createFirstPostBtn: "+ Create First Post",
    securityTitle: "Integration Status & Security",
    securitySubtitle: "All account tokens are protected by AES-256-GCM hardware encryption.",
    manageAccountsBtn: "Manage Accounts",
  },
  accounts: {
    title: "Connected Social Accounts",
    subtitle: "Manage official Instagram, Telegram, and YouTube integrations via AES-256 Token Vault.",
    refreshBtn: "Refresh",
    coreSection: "Core Integrations (Tier 1)",
    optionalSection: "Optional Platforms (Tier 2)",
    activeAccountsTitle: "Active Connected Accounts",
    noAccountsTitle: "No connected accounts yet",
    noAccountsDesc: "Click one of the buttons above to connect Instagram, Telegram, or YouTube.",
    connectBtn: "Connect",
    disconnectBtn: "Disconnect",
    statusConnected: "Connected",
    statusDisconnected: "Disconnected",
    statusBlocked: "Pending Approval",
    approvalPending: "Approval Pending",
    partnerGated: "Partner Gated",
    tokenVaultProtected: "Secured by AES-256 Token Vault",
    telegramTitle: "Telegram Bot & Channels",
    telegramDesc: "Instant broadcast to channels and groups via official Bot API with full Markdown styling.",
    instagramTitle: "Instagram Professional",
    instagramDesc: "Publish posts, carousels, and Reels to business accounts via official Meta Graph API.",
    youtubeTitle: "YouTube Creator Channel",
    youtubeDesc: "Upload videos and Shorts via YouTube Data API v3 with titles, tags, and privacy settings.",
    tiktokTitle: "TikTok Content Posting API",
    tiktokDesc: "Requires verified commercial developer partnership approval from TikTok.",
    linkedinTitle: "LinkedIn Community Management",
    linkedinDesc: "Requires approved LinkedIn Developer Community Management partner scope.",
  },
  createPost: {
    pageTitle: "Create Post",
    pageSubtitle: "Write once, customize, and publish to multiple channels simultaneously.",
    destinationLabel: "Where to publish? (Select channels)",
    noChannelsLinked: "No connected channels found.",
    linkChannelCta: "Connect Channel ->",
    titleLabel: "Title (Optional or for YouTube)",
    titlePlaceholder: "e.g. New Product Launch Reveal",
    captionLabel: "Post Caption",
    captionPlaceholder: "Type your post copy here or generate with AI Assistant...",
    charCount: "characters",
    hashtagsLabel: "Hashtags",
    hashtagsPlaceholder: "e.g. product, launch, tech",
    addBtn: "Add",
    mediaLabel: "Image or Video URLs",
    mediaPlaceholder: "https://... or select from Media Library",
    attachBtn: "Attach",
    scheduleToggle: "Schedule Publication",
    publishNowBtn: "Publish Now",
    scheduleBtn: "Schedule Post",
    livePreviewTitle: "Live Preview",
    previewPlaceholder: "Your post copy will appear here...",
    successPublish: "Post published successfully to all selected channels!",
    successSchedule: "Post scheduled successfully for selected time!",
  },
  assistant: {
    copilotTitle: "NovaSphere AI Assistant",
    copilotSubtitle: "Autonomous social media content & captioning assistant",
    initialGreeting: "Hello! I am your NovaSphere AI Assistant. Ask me to write engaging posts, find viral hashtags, or generate a cross-platform content plan.",
    inputPlaceholder: "Enter your instruction (e.g. 'Write an engaging Telegram announcement about our weekend promo')...",
    sendBtn: "Send",
    actionApproved: "Action approved and dispatched to execution engine.",
    unconfiguredNotice: "AI provider key is not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY in Settings.",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your NovaSphere AI workspace",
    registerTitle: "Create an account",
    registerSubtitle: "Start managing your social media channels professionally",
    emailLabel: "Work Email",
    passwordLabel: "Password",
    fullNameLabel: "Full Name",
    orgNameLabel: "Workspace / Organization Name",
    loginBtn: "Sign In",
    registerBtn: "Create Free Account",
    googleBtn: "Continue with Google",
    forgotPasswordLink: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already registered?",
    invalidCredentials: "Invalid email or password",
    resetPasswordTitle: "Reset Password",
    resetPasswordSubtitle: "Enter your new secure password",
    newPasswordLabel: "New Password",
    saveNewPasswordBtn: "Save New Password",
    verifyEmailTitle: "Verify Your Email",
    verifyEmailSubtitle: "Enter the 6-digit confirmation code sent to your email",
    verifyBtn: "Verify",
    resendBtn: "Resend Code",
  },
  autonomy: {
    advisor: "Advisor (Mode 1)",
    creator: "Creator (Mode 2)",
    operator: "Operator (Mode 3)",
    autopilot: "Autopilot (Mode 4)",
  },
  landing: {
    navFeatures: "Features",
    navPlatforms: "Platforms",
    navSecurity: "Security",
    heroBadge: "Smart Social Media Management & Publishing Hub",
    heroTitle1: "Manage All Your Social Media",
    heroTitle2: "From One Unified Hub",
    heroSubtitle: "Publish and schedule posts to Instagram, Telegram, and YouTube in one click, write captivating copy with AI, and track your audience growth.",
    goToDashboard: "Go to Dashboard",
    createFirstPost: "Create First Post",
    platformsTitle: "Official API Integrations",
    platformsSubtitle: "Zero mock simulations — the platform operates directly through verified social network APIs.",
    featuresTitle: "Everything You Need for Social Growth",
    featuresSubtitle: "Streamline your daily content creation, publishing, and scheduling workflow.",
    securityBadge: "AES-256-GCM Token Vault",
    securityTitle: "Enterprise-Grade Token Protection",
    securitySubtitle: "Every bot token and OAuth secret is encrypted with AES-256-GCM using hardware-grade key management.",
    createAccountCta: "Get Started Free",
  },
};

export const translations: Record<Language, Translations> = {
  uzl: uzlTranslations,
  uzc: uzcTranslations,
  'uz-Latn': uzlTranslations,
  'uz-Cyrl': uzcTranslations,
  ru: ruTranslations,
  en: enTranslations,
};
