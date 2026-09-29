import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.services.wallet_service import WalletService

CATALOG_PRODUCTS: List[Dict[str, Any]] = [
    {
        "id": "racket-padel-1",
        "name_fa": "راکت پدل بول‌پدل مدل Hack 03 2024",
        "name_en": "Bullpadel Hack 03 2024 Padel Racket",
        "brand": "Bullpadel",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "PRO",
        "original_price": 18500000,
        "discount_percent": 10,
        "price": 16650000,
        "stock": 8,
        "weight": "365-375 گرم",
        "balance": "بالا (Head Heavy)",
        "shape": "الماس (Diamond)",
        "surface": "کربن سه‌بعدی Tricarbon",
        "core": "فوم چندلایه MultiEVA",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/bullpadel_hack.jpg",
        "rating": 4.9,
        "reviews_count": 34,
        "description": "راکت رسمی پاکیتو ناوارو (Paquito Navarro) در مسابقات Premier Padel با سیستم کنترل شوک Vibradrive و کانال هوایی Air React Channel."
    },
    {
        "id": "racket-padel-2",
        "name_fa": "راکت پدل بابولات مدل Technical Viper Juan Lebrón",
        "name_en": "Babolat Technical Viper Juan Lebrón",
        "brand": "Babolat",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "PRO",
        "original_price": 19200000,
        "discount_percent": 5,
        "price": 18240000,
        "stock": 5,
        "weight": "365 گرم",
        "balance": "بالا (Head Heavy)",
        "shape": "الماس (Diamond)",
        "surface": "کربن ۱۲K فوق متراکم",
        "core": "فوم سه‌لایه X-EVA",
        "warranty": "گارانتی اصالت ۶ ماهه رالی",
        "image_url": "/images/babolat_viper.jpg",
        "rating": 4.95,
        "reviews_count": 28,
        "description": "راکت امضای خوان لبرون با قدرت انفجاری در اسمش‌ها و سطح زبر 3D Spin+ جهت بیشترین چرخش توپ."
    },
    {
        "id": "racket-padel-3",
        "name_fa": "راکت پدل نوکس مدل AT10 Genius 18K Alum ۲۰۲۴ آگوستین تاپیا",
        "name_en": "NOX AT10 Luxury Genius 18K Alum by Agustín Tapia 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 18900000,
        "discount_percent": 8,
        "price": 17388000,
        "stock": 14,
        "weight": "360-375 گرم",
        "balance": "متعادل (Even)",
        "shape": "اشکی (Teardrop)",
        "surface": "کربن ۱۸K آلومینایز بافت‌دار زبر",
        "core": "MLD Black EVA چندلایه",
        "warranty": "ضمانت ۶ ماهه اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/nox_at10.jpg",
        "rating": 4.95,
        "reviews_count": 58,
        "description": "راکت رسمی شماره یک پدل دنیا آگوستین تاپیا مجهز به دریچه‌های جانبی EOS Flap و بند مگنتیک Smartstrap.",
        "power_index": 9.0,
        "control_index": 10.0,
        "series": "Luxury Series",
        "player_signature": "Agustín Tapia"
    },
    {
        "id": "nox-at10-12k-2024",
        "name_fa": "راکت پدل نوکس مدل AT10 Genius 12K ۲۰۲۴ آگوستین تاپیا",
        "name_en": "NOX AT10 Luxury Genius 12K by Agustín Tapia 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 17800000,
        "discount_percent": 5,
        "price": 16910000,
        "stock": 9,
        "weight": "360-375 گرم",
        "balance": "متعادل (Even)",
        "shape": "اشکی (Teardrop)",
        "surface": "کربن ۱۲K فوق متراکم با سطح شنی Rough Surface",
        "core": "MLD Black EVA چندلایه",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/nox_at10.jpg",
        "rating": 4.90,
        "reviews_count": 37,
        "description": "نسخه لمس مستقیم و محکم‌تر خانواده تاپیا با الیاف فشرده ۱۲K برای ضربات تهاجمی سریع و شلیک‌های والی صلب.",
        "power_index": 9.0,
        "control_index": 10.0,
        "series": "Luxury Series",
        "player_signature": "Agustín Tapia"
    },
    {
        "id": "nox-at10-attack-18k",
        "name_fa": "راکت پدل نوکس مدل AT10 Genius Attack 18K Alum الماسی تهاجمی",
        "name_en": "NOX AT10 Luxury Genius Attack 18K Alum 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "PRO",
        "original_price": 19500000,
        "discount_percent": 10,
        "price": 17550000,
        "stock": 6,
        "weight": "365-375 گرم",
        "balance": "سر سنگین تهاجمی (Head Heavy)",
        "shape": "الماس (Diamond)",
        "surface": "کربن ۱۸K آلومینایز",
        "core": "MLD Black EVA چندلایه",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/nox_at10.jpg",
        "rating": 4.92,
        "reviews_count": 29,
        "description": "فریم الماسی آیرودینامیک برای حداکثر قدرت اهرمی در اسمش‌های Por Tres و ضربات هوایی سرکش.",
        "power_index": 10.0,
        "control_index": 9.0,
        "series": "Luxury Series",
        "player_signature": "Agustín Tapia"
    },
    {
        "id": "nox-ml10-pro-cup",
        "name_fa": "راکت پدل نوکس اسطوره‌ای مدل ML10 Pro Cup Coorp میگل لامپرتی",
        "name_en": "NOX ML10 Pro Cup Coorp Classic by Miguel Lamperti",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 15900000,
        "discount_percent": 7,
        "price": 14787000,
        "stock": 18,
        "weight": "360-375 گرم",
        "balance": "پایین و خوش‌دست (Low Balance)",
        "shape": "گرد (Round)",
        "surface": "فایبرگلاس نقره‌ای ۳K متالیک Silver",
        "core": "فوم اسطوره‌ای HR3 نوکس با بازیابی الاستیک آنی",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/padel_racket.jpg",
        "rating": 4.98,
        "reviews_count": 84,
        "description": "پرفروش‌ترین و ماندگارترین راکت تاریخ ورزش پدل؛ دستپخت اسطوره کاریزماتیک پدل جهان میگل لامپرتی.",
        "power_index": 9.0,
        "control_index": 10.0,
        "series": "Pro Series",
        "player_signature": "Miguel Lamperti"
    },
    {
        "id": "nox-ml10-shotgun-18k",
        "name_fa": "راکت پدل نوکس مدل ML10 Luxury Shotgun 18K قدرت انفجاری",
        "name_en": "NOX ML10 Luxury Shotgun 18K by Miguel Lamperti 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "PRO",
        "original_price": 18600000,
        "discount_percent": 6,
        "price": 17484000,
        "stock": 7,
        "weight": "365-375 گرم",
        "balance": "سر سنگین (Head Heavy)",
        "shape": "الماس (Diamond)",
        "surface": "کربن ۱۸K زبر سه‌بعدی",
        "core": "فوم HR3 Black EVA",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/nox_at10.jpg",
        "rating": 4.88,
        "reviews_count": 22,
        "description": "طراحی ویژه شوت‌های نهایی و اسمش‌های کوبنده با امضای میگل لامپرتی؛ مجهز به سیستم فیلتراسیون لرزش AVS.",
        "power_index": 10.0,
        "control_index": 8.5,
        "series": "Luxury Series",
        "player_signature": "Miguel Lamperti"
    },
    {
        "id": "nox-ml10-bahia-12k",
        "name_fa": "راکت پدل نوکس مدل ML10 Luxury Bahia 12K توازن همه‌کاره",
        "name_en": "NOX ML10 Luxury Bahia 12K by Miguel Lamperti 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 17500000,
        "discount_percent": 8,
        "price": 16100000,
        "stock": 11,
        "weight": "360-375 گرم",
        "balance": "متعادل (Even Balance)",
        "shape": "اشکی (Teardrop)",
        "surface": "کربن ۱۲K مقاوم",
        "core": "MLD Black EVA چندلایه",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/nox_at10.jpg",
        "rating": 4.91,
        "reviews_count": 31,
        "description": "راکت ادای احترام به شهر زادگاه میگل لامپرتی؛ توازن فوق‌العاده میان استحکام دفاعی و سرعت سویینگ.",
        "power_index": 9.5,
        "control_index": 9.5,
        "series": "Luxury Series",
        "player_signature": "Miguel Lamperti"
    },
    {
        "id": "nox-vk10-future",
        "name_fa": "راکت پدل نوکس مدل VK10 Future آرانتزاسو اوسورو (وایکینگ)",
        "name_en": "NOX VK10 Future by Aránzazu Osoro 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 16200000,
        "discount_percent": 10,
        "price": 14580000,
        "stock": 8,
        "weight": "355-370 گرم",
        "balance": "سر سبک خوش‌دست (Head Light)",
        "shape": "گرد (Round)",
        "surface": "کربن آلومینایز بافت الاستیک",
        "core": "فوم HR3 Black EVA",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/padel_racket.jpg",
        "rating": 4.87,
        "reviews_count": 18,
        "description": "راکت رسمی ستاره آرژانتینی آرانتزاسو اوسورو؛ کنترل لیزری با وزن بهینه و سیستم جذب شوک ضد تنیس البو.",
        "power_index": 8.5,
        "control_index": 10.0,
        "series": "Future Series",
        "player_signature": "Aránzazu Osoro"
    },
    {
        "id": "nox-tl10-quantum-12k",
        "name_fa": "راکت پدل نوکس مدل TL10 Quantum 12K پدیده تینو لیباک",
        "name_en": "NOX TL10 Quantum 12K by Tino Libaak 2024",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 16900000,
        "discount_percent": 5,
        "price": 16055000,
        "stock": 7,
        "weight": "360-375 گرم",
        "balance": "متعادل (Even)",
        "shape": "اشکی مدرن (Teardrop)",
        "surface": "کربن ۱۲K با پوشش فتوکرومیک متغیر در آفتاب",
        "core": "HR3 Color EVA",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/nox_at10.jpg",
        "rating": 4.89,
        "reviews_count": 15,
        "description": "راکت پدیده جوان فینالیست WPT تینو لیباک؛ مجهز به رنگ خاص فتوکرومیک و سرعت عکس‌العمل سرسام‌آور.",
        "power_index": 9.5,
        "control_index": 9.5,
        "series": "Quantum Series",
        "player_signature": "Tino Libaak"
    },
    {
        "id": "nox-equation-advanced",
        "name_fa": "راکت پدل نوکس مدل Equation Advanced ۲۰۲۴ (برترین ارزش خرید)",
        "name_en": "NOX Equation Advanced 2024 Racket",
        "brand": "Nox",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "INTERMEDIATE",
        "original_price": 12800000,
        "discount_percent": 12,
        "price": 11264000,
        "stock": 20,
        "weight": "360-375 گرم",
        "balance": "متعادل (Even)",
        "shape": "گرد (Round)",
        "surface": "فایبرگلاس ۳K با لایه محافظ شفاف ۳M",
        "core": "فوم HR3 نوکس",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/padel_racket.jpg",
        "rating": 4.85,
        "reviews_count": 46,
        "description": "برنده جایزه بهترین راکت سطح متوسط پدل در اسپانیا؛ مانورپذیری بالا و نقطه ضربه وسیع.",
        "power_index": 8.5,
        "control_index": 9.5,
        "series": "Advanced Series"
    },
    {
        "id": "racket-padel-4",
        "name_fa": "راکت پدل هد مدل Speed Pro Padel 2024",
        "name_en": "Head Speed Pro Padel 2024",
        "brand": "Head",
        "category": "PADEL_RACKET",
        "sport": "PADEL",
        "level": "INTERMEDIATE",
        "original_price": 15400000,
        "discount_percent": 12,
        "price": 13552000,
        "stock": 6,
        "weight": "370 گرم",
        "balance": "متعادل (Even)",
        "shape": "اشکی (Teardrop)",
        "surface": "هیبرید کربن و فایبرگلاس با تکنولوژی Auxetic",
        "core": "Power Foam",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/head_speed_padel.jpg",
        "rating": 4.75,
        "reviews_count": 19,
        "description": "طراحی پیشرفته برای بازیکنان سریع با نقطه Sweetspot بزرگ و قابلیت مانور بالا در والی‌ها."
    },
    {
        "id": "racket-tennis-1",
        "name_fa": "راکت تنیس ویلسون مدل Pro Staff 97 v14",
        "name_en": "Wilson Pro Staff 97 v14 Tennis Racket",
        "brand": "Wilson",
        "category": "TENNIS_RACKET",
        "sport": "TENNIS",
        "level": "PRO",
        "original_price": 16800000,
        "discount_percent": 5,
        "price": 15960000,
        "stock": 7,
        "weight": "315 گرم بدون زه",
        "balance": "۳۱ سانتی‌متر (۱۰ پوینت Head Light)",
        "shape": "اندازه صفحه ۹۷ اینچ مربع",
        "surface": "بافت گرافیت و کولار Braid 45",
        "core": "Paradigm Bending",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/wilson_prostaff.jpg",
        "rating": 4.92,
        "reviews_count": 25,
        "description": "شاهکار مهندسی تنیس الهام‌گرفته از راجر فدرر؛ بالاترین دقت ضربه و احساس ارتباط با توپ در خط انتهایی."
    },
    {
        "id": "racket-tennis-2",
        "name_fa": "راکت تنیس بابولات مدل Pure Aero 2023 Rafa Edition",
        "name_en": "Babolat Pure Aero 2023 Rafa Edition",
        "brand": "Babolat",
        "category": "TENNIS_RACKET",
        "sport": "TENNIS",
        "level": "ADVANCED",
        "original_price": 15900000,
        "discount_percent": 10,
        "price": 14310000,
        "stock": 10,
        "weight": "300 گرم",
        "balance": "۳۲ سانتی‌متر (۷ پوینت سر سبک)",
        "shape": "اندازه صفحه ۱۰۰ اینچ مربع",
        "surface": "کربن Aeromodular 3 و الیاف Flax فیبر کتان",
        "core": "FSI Spin Pattern",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/babolat_pure_aero.jpg",
        "rating": 4.85,
        "reviews_count": 31,
        "description": "پادشاه تاپ‌اسپین رافائل نادال؛ ماکسیمم اسپین و قدرت سنگین برای عقب راندن حریفان از تور."
    },
    {
        "id": "racket-tennis-3",
        "name_fa": "راکت تنیس یونکس مدل EZONE 98 ژاپن",
        "name_en": "Yonex EZONE 98 Made in Japan",
        "brand": "Yonex",
        "category": "TENNIS_RACKET",
        "sport": "TENNIS",
        "level": "ADVANCED",
        "original_price": 17200000,
        "discount_percent": 0,
        "price": 17200000,
        "stock": 5,
        "weight": "305 گرم",
        "balance": "۳۱.۵ سانتی‌متر",
        "shape": "فریم ایزومتریک ۹۸ اینچ",
        "surface": "2G-Namd Speed گرافیتی",
        "core": "Vibration Dampening Mesh",
        "warranty": "ضمانت اصالت و سلامت فیزیکی رالی",
        "image_url": "/images/yonex_ezone.jpg",
        "rating": 4.9,
        "reviews_count": 18,
        "description": "ساخت دقیق در کارخانه نیگاتا ژاپن؛ ترکیبی بی‌نظیر از نرمی ضربه و سرعت انفجاری سرویس."
    },
    {
        "id": "acc-balls-1",
        "name_fa": "باکس ۳ عددی توپ پدل هد مدل Head Padel Pro S",
        "name_en": "Head Padel Pro S Padel Balls (Can of 3)",
        "brand": "Head",
        "category": "BALLS",
        "sport": "PADEL",
        "level": "PRO",
        "original_price": 580000,
        "discount_percent": 0,
        "price": 580000,
        "stock": 50,
        "weight": "استاندارد FIP",
        "balance": "فشار گاز پایدار مسابقه‌ای",
        "shape": "توپ کروی نمدی",
        "surface": "نمد تقویت‌شده ضخیم مسابقه‌ای",
        "core": "لاستیک فشرده مقاوم",
        "warranty": "ضمانت پلمب و فشار استاندارد کارخانه",
        "image_url": "/images/head_padel_balls.jpg",
        "rating": 4.9,
        "reviews_count": 67,
        "description": "توپ رسمی مسابقات فدراسیون جهانی پدل (FIP) با پرش سریع‌تر و دوام مضاعف نسبت به نسخه معمولی."
    },
    {
        "id": "acc-balls-2",
        "name_fa": "قوطی ۴ عددی توپ تنیس ویلسون مدل Roland Garros",
        "name_en": "Wilson Roland Garros All Court Balls (Can of 4)",
        "brand": "Wilson",
        "category": "BALLS",
        "sport": "TENNIS",
        "level": "ADVANCED",
        "original_price": 720000,
        "discount_percent": 5,
        "price": 684000,
        "stock": 40,
        "weight": "استاندارد ITF",
        "balance": "فشار پیوسته با هسته Core Tech",
        "shape": "توپ تنیس گرنداسلم",
        "surface": "نمد بافته‌شده مرغوب All Court",
        "core": "لاستیک طبیعی ولکانیزه",
        "warranty": "ضمانت پلمب کارخانه",
        "image_url": "/images/wilson_balls.jpg",
        "rating": 4.8,
        "reviews_count": 39,
        "description": "توپ رسمی مسابقات تنیس آزاد فرانسه رولان گاروس با دید بالا و مقاومت در برابر رطوبت."
    },
    {
        "id": "acc-grip-1",
        "name_fa": "پک ۳ عددی اورگریپ ویلسون مدل Pro Overgrip",
        "name_en": "Wilson Pro Overgrip 3-Pack White",
        "brand": "Wilson",
        "category": "ACCESSORIES",
        "sport": "PADEL",
        "level": "INTERMEDIATE",
        "original_price": 390000,
        "discount_percent": 0,
        "price": 390000,
        "stock": 80,
        "weight": "ضخامت ۰.۶ میلی‌متر",
        "balance": "تکستچر فوق چسبنده (Tacky)",
        "shape": "نوار رولی الاستیک",
        "surface": "پلی‌یورتان میکروفیبر ضد تعریق",
        "core": "لایه جاذب رطوبت",
        "warranty": "تضمین اصالت اورجینال",
        "image_url": "/images/wilson_grip.jpg",
        "rating": 4.95,
        "reviews_count": 112,
        "description": "محبوب‌ترین اورگریپ در میان بازیکنان حرفه‌ای جهان؛ جذب عرق فوق‌العاده و ممانعت از چرخش راکت در دست."
    },
    {
        "id": "acc-bag-1",
        "name_fa": "ساک حرارتی بول‌پدل مدل Hack Monster Pro",
        "name_en": "Bullpadel Hack Monster Pro Padel Bag",
        "brand": "Bullpadel",
        "category": "BAGS",
        "sport": "PADEL",
        "level": "PRO",
        "original_price": 6800000,
        "discount_percent": 10,
        "price": 6120000,
        "stock": 6,
        "weight": "گنجایش تا ۴ راکت و کفش",
        "balance": "دو بند کوله‌ای ارگونومیک",
        "shape": "ساک پالترو تخصصی",
        "surface": "پارچه برزنتی ریپ‌استاپ ضد آب",
        "core": "دو محفظه عایق حرارتی Thermo Compartment",
        "warranty": "گارانتی سلامت فیزیکی رالی",
        "image_url": "/images/bullpadel_bag.jpg",
        "rating": 4.88,
        "reviews_count": 14,
        "description": "ساک پرچمدار بول‌پدل با محفظه تهویه‌دار مخصوص کفش کثیف و جیب‌های جانبی برای لوازم ارزشمند."
    },
    {
        "id": "shoes-1",
        "name_fa": "کفش تخصصی پدل اسیکس مدل Gel-Resolution 9 Padel",
        "name_en": "Asics Gel-Resolution 9 Padel Shoes",
        "brand": "Asics",
        "category": "SHOES",
        "sport": "PADEL",
        "level": "ADVANCED",
        "original_price": 11500000,
        "discount_percent": 8,
        "price": 10580000,
        "stock": 12,
        "weight": "سایزهای ۴۰ تا ۴۶",
        "balance": "کفی تخصصی Herringbone هیرینگ‌بون",
        "shape": "کفش ورزشی کورت",
        "surface": "فناوری DYNAWALL جهت پایداری پیچشی مچ",
        "core": "ژل جاذب ضربه GEL در جلو و پاشنه",
        "warranty": "ضمانت ۱۰۰٪ اصالت ژاپن",
        "image_url": "/images/asics_shoes.jpg",
        "rating": 4.92,
        "reviews_count": 21,
        "description": "بهترین محافظت از مچ پا در پیچش‌های ناگهانی کورت پدل با چسبندگی فوق‌العاده روی چمن مصنوعی شنی."
    }
]

COUPONS: Dict[str, float] = {
    "RALLY10": 0.10,
    "FIRSTORDER": 0.15,
    "VIPMEMBER": 0.20
}

class ShopService:
    @staticmethod
    def get_products(
        category: Optional[str] = None,
        sport: Optional[str] = None,
        brand: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = CATALOG_PRODUCTS.copy()
        if category:
            results = [p for p in results if p["category"] == category]
        if sport:
            results = [p for p in results if p["sport"] == sport]
        if brand:
            results = [p for p in results if p["brand"].lower() == brand.lower()]
        if search:
            q = search.lower().strip()
            results = [
                p for p in results 
                if q in p["name_fa"].lower() or q in p["name_en"].lower() or q in p["brand"].lower()
            ]
        return results

    @staticmethod
    def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
        for p in CATALOG_PRODUCTS:
            if p["id"] == product_id:
                return p
        return None

    @staticmethod
    def calculate_cart(items: List[Dict[str, Any]], coupon_code: Optional[str] = None) -> Dict[str, Any]:
        subtotal = 0
        validated_items = []

        for item in items:
            pid = item.get("product_id")
            qty = int(item.get("quantity", 1))
            product = ShopService.get_product_by_id(pid)
            if not product:
                continue
            unit_price = product["price"]
            item_total = unit_price * qty
            subtotal += item_total
            validated_items.append({
                "product_id": pid,
                "name_fa": product["name_fa"],
                "quantity": qty,
                "unit_price": unit_price,
                "total_price": item_total,
                "image_url": product.get("image_url")
            })

        # Shipping logic: Free shipping over 2,000,000 Tomans
        shipping_fee = 0 if subtotal >= 2000000 or subtotal == 0 else 120000

        # Coupon calculation
        discount_amount = 0
        discount_rate = 0.0
        if coupon_code and coupon_code.upper() in COUPONS:
            discount_rate = COUPONS[coupon_code.upper()]
            discount_amount = int(subtotal * discount_rate)

        total_amount = max(0, subtotal - discount_amount + shipping_fee)

        return {
            "items": validated_items,
            "items_count": sum(i["quantity"] for i in validated_items),
            "subtotal": subtotal,
            "shipping_fee": shipping_fee,
            "is_free_shipping": shipping_fee == 0 and subtotal > 0,
            "coupon_code": coupon_code.upper() if coupon_code and discount_amount > 0 else None,
            "discount_amount": discount_amount,
            "total_amount": total_amount,
            "total_amount_rials": total_amount * 10
        }

    @staticmethod
    async def checkout_order(
        db: AsyncSession,
        user_id: str,
        items: List[Dict[str, Any]],
        delivery_address: str,
        receiver_name: str,
        receiver_phone: str,
        payment_method: str = "WALLET",
        coupon_code: Optional[str] = None
    ) -> Dict[str, Any]:
        cart = ShopService.calculate_cart(items=items, coupon_code=coupon_code)
        if cart["items_count"] == 0:
            raise ValueError("سبد خرید شما خالی است.")

        total_tomans = cart["total_amount"]
        total_rials = total_tomans * 10

        tracking_code = f"RLY-SHP-{uuid.uuid4().hex[:8].upper()}"

        if payment_method == "WALLET":
            # Deduct from user wallet in Rials
            wallet = await WalletService.get_or_create_wallet(db, user_id)
            if wallet.balance < total_rials:
                raise ValueError(f"موجودی کیف پول کافی نیست. موجودی: {wallet.balance // 10:,} تومان - مورد نیاز: {total_tomans:,} تومان")
            
            await WalletService.deduct_balance(
                db=db,
                user_id=user_id,
                amount=total_rials,
                description=f"خرید تجهیزات و راکت از فروشگاه رالی با کد رهگیری {tracking_code}"
            )

        order_record = {
            "order_id": str(uuid.uuid4()),
            "tracking_code": tracking_code,
            "user_id": user_id,
            "receiver_name": receiver_name,
            "receiver_phone": receiver_phone,
            "delivery_address": delivery_address,
            "payment_method": payment_method,
            "items": cart["items"],
            "subtotal": cart["subtotal"],
            "shipping_fee": cart["shipping_fee"],
            "discount_amount": cart["discount_amount"],
            "total_amount": total_tomans,
            "status": "PAID" if payment_method == "WALLET" else "WAITING_PAYMENT",
            "payment_url": f"/api/v1/payments/shaparak-gateway?order_id={tracking_code}&amount={total_rials}" if payment_method != "WALLET" else None,
            "created_at": datetime.now().isoformat()
        }
        return order_record
