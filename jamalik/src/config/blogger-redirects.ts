// ⚠️ ملف مُولَّد — لا يُحرَّر يدويًا. انظر scripts/blogger/emit-seed.ts
//
// خريطة تحويل روابط Blogger القديمة إلى روابط المقالات الجديدة. تُقرأ في
// next.config.ts وتُصدَر تحويلات ٣٠١ دائمة، فتحتفظ الروابط المفهرسة بقيمتها
// ولا يقع زائر قديم على صفحة ٤٠٤.

export type BloggerRedirect = { from: string; to: string };

export const bloggerRedirects: BloggerRedirect[] = [
  {
    "from": "/2026/05/blog-post_870.html",
    "to": "/article/sr-mn-asrar-aljmal-altbyay-alsdr-ma-maa-alwrd"
  },
  {
    "from": "/2026/06/blog-post.html",
    "to": "/article/awraq-aljwafh-ltqwyh-almnaah"
  },
  {
    "from": "/2026/05/blog-post_27.html",
    "to": "/article/alshbh-kmzyl-arq-tbyay-w-amn"
  },
  {
    "from": "/2026/07/blog-post.html",
    "to": "/article/tyn-albhr-almyt-sr-altbyah-lbshrh-shyh-wjsm-akthr-antaasha"
  },
  {
    "from": "/2026/07/blog-post_19.html",
    "to": "/article/aktshfy-fwaed-maa-alarz-llshar-wtryqh-thdyrh-wastkhdamh-alsh"
  },
  {
    "from": "/2026/04/blog-post.html",
    "to": "/article/tjrbh-alzbady-ma-almshat"
  },
  {
    "from": "/2026/05/blog-post_12.html",
    "to": "/article/krym-shar-shya-mwystshr-alazrq-basl-almanwka-w-alzbady"
  },
  {
    "from": "/2026/06/blog-post_18.html",
    "to": "/article/lmadha-yjb-an-ykwn-allymwn-rfyqk-aldaem"
  },
  {
    "from": "/2026/05/blog-post_705.html",
    "to": "/article/afdl-mzlq-tbyay-zyt-jwz-alhnd-aladwy-albkr"
  },
  {
    "from": "/2026/08/blog-post.html",
    "to": "/article/tryqh-istkhdam-zyt-alarjan-almghrby"
  },
  {
    "from": "/2026/06/blog-post_25.html",
    "to": "/article/aktshf-fwaed-jl-alalwfyra-alsbar-llbshrh-walshar-wkyf-ysaad"
  },
  {
    "from": "/2026/05/blog-post_613.html",
    "to": "/article/faedh-alhnaa-llshar"
  },
  {
    "from": "/2026/08/blog-post_08.html",
    "to": "/article/fwaed-almrh-wastkhdamatha-llbshrh-walshar-walanayh-baljsm"
  },
  {
    "from": "/2026/05/why-avocado-is-good-for-hair.html",
    "to": "/article/why-avocado-is-good-for-hair"
  },
  {
    "from": "/2026/08/blog-post_13.html",
    "to": "/article/bdhwr-almash-fwaedha-alshyh-wtryqh-astkhdamha-wahm-adrarha"
  },
  {
    "from": "/2026/05/blog-post_23.html",
    "to": "/article/lban-aldhkr-llshh-w-aljmal"
  },
  {
    "from": "/2026/07/blog-post_23.html",
    "to": "/article/almlh-kmthr-aam-ala-hw-faal-hqa-fwaedh-w-astkhdamath-alshyhh"
  },
  {
    "from": "/2026/05/blog-post_128.html",
    "to": "/article/abrz-fwaed-alqrfh-lmrda-alskry"
  },
  {
    "from": "/2026/05/blog-post.html",
    "to": "/article/kyf-mfawl-krym-kynya-ma-zyt-alwrd-yaml-kalshr-ltbyyd-almnatq"
  },
  {
    "from": "/2026/05/blog-post_26.html",
    "to": "/article/alasl-kalaj-tbyay-ljrthwmh-almadh"
  },
  {
    "from": "/2026/05/fenugreek-natural-secret-for-health-and.html",
    "to": "/article/fenugreek-a-natural-secret-for-health-and-beauty"
  },
  {
    "from": "/2026/05/blog-post_14.html",
    "to": "/article/aldlkh-alswdanyh-sr-shbab-bshrh-alswdanyat"
  },
  {
    "from": "/2026/05/blog-post_13.html",
    "to": "/article/fwaed-awmygha-llnsaa-sr-alshh-w-aljmal-altbyay"
  },
  {
    "from": "/2026/06/blog-post_13.html",
    "to": "/article/wsfat-alarqsws-altbyayh"
  },
  {
    "from": "/2026/07/blog-post_322.html",
    "to": "/article/afdl-zyt-lttwyl-alhwajb-w-alrmwsh"
  },
  {
    "from": "/2026/05/blog-post_21.html",
    "to": "/article/albabaya-alfakhh-alghnyh-balfytamynat-walanasr-almhmh"
  },
  {
    "from": "/2026/05/blog-post_19.html",
    "to": "/article/zbdh-alshya-llshar-w-aljsm"
  },
  {
    "from": "/2026/07/blog-post_21.html",
    "to": "/article/afdl-alzywt-lttwyl-alshar-wtkthyfh-dlyl-shaml-llhswl-ala-sha"
  },
  {
    "from": "/2026/04/blog-post_24.html",
    "to": "/article/dlyl-shaml-lastkhdamat-alfazlyn-fy-alanayh-balbshrh-walshar"
  },
  {
    "from": "/2026/05/henna-in-arab-traditional-beauty.html",
    "to": "/article/henna-in-arab-traditional-beauty"
  },
  {
    "from": "/2026/08/blog-post_29.html",
    "to": "/article/khl-altfah-fwaedh-wastkhdamath-wadrarh-wafdl-tryqh-lastkhdam"
  },
  {
    "from": "/2026/05/blog-post_380.html",
    "to": "/article/alfrq-byn-alkwlajyn-albqry-w-albhry"
  },
  {
    "from": "/2026/05/blog-post_25.html",
    "to": "/article/ashhr-sabwn-tqlydy-wtbyay-ala-alitlaq"
  },
  {
    "from": "/2026/07/blog-post_27.html",
    "to": "/article/zyt-alqtran-llshar-alfwaed-w-aladrar-wtryqh-alastkhdam"
  },
  {
    "from": "/2026/05/blog-post_17.html",
    "to": "/article/fwaed-zyt-alwrd-llbshrh-w-alshar"
  },
  {
    "from": "/2026/05/blog-post_30.html",
    "to": "/article/qshwr-alrman-almjffh-tryqh-alastkhdam"
  },
  {
    "from": "/2026/07/blog-post_09.html",
    "to": "/article/fwaed-zyt-alkhrwa-llrmwsh-alastkhdam-alshyh-wahm-alfwaed-wal"
  },
  {
    "from": "/2026/07/blog-post_07.html",
    "to": "/article/fwaed-zyt-iklyl-aljbl-llshar-alastkhdam-alshyh-wahm-alfwaed"
  },
  {
    "from": "/p/blog-page.html",
    "to": "/about"
  },
  {
    "from": "/p/blog-page_25.html",
    "to": "/privacy-policy"
  },
  {
    "from": "/p/blog-page_21.html",
    "to": "/terms"
  },
  {
    "from": "/p/blog-page_23.html",
    "to": "/disclaimer"
  },
  {
    "from": "/p/0508517675-redgalaxy70gmail.html",
    "to": "/contact"
  },
  {
    "from": "/2026/06/blog-post_346.html",
    "to": "/article/lmadha-yjb-an-ykwn-allymwn-rfyqk-aldaem"
  }
];
