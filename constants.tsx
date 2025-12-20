
import { Lesson, LessonId } from './types';

export const LESSONS: Lesson[] = [
  {
    id: LessonId.Intro,
    title: "1. مقدمة في بايثون",
    content: "بايثون هي لغة برمجة قوية وسهلة التعلم. تُستخدم في الذكاء الاصطناعي، تطوير المواقع، وتحليل البيانات. في هذا الدرس سنتعلم كيف نخرج النصوص للشاشة.",
    defaultCode: "print('مرحباً بك في عالم بايثون!')"
  },
  {
    id: LessonId.Variables,
    title: "2. المتغيرات والبيانات",
    content: "المتغيرات هي مخازن للقيم. يمكننا تخزين الأسماء (نصوص) أو الأعمار (أرقام). جرب تغيير القيم في الكود.",
    defaultCode: "name = 'أحمد'\nage = 25\nprint(f'الاسم: {name}, العمر: {age}')"
  },
  {
    id: LessonId.Conditionals,
    title: "3. الجمل الشرطية If..Then",
    content: "الجمل الشرطية تسمح للبرنامج باتخاذ قرارات. إذا تحقق الشرط ينفذ الكود، وإلا ينفذ كود آخر (else).",
    defaultCode: "score = 85\n\nif score >= 90:\n    print('ممتاز!')\nelif score >= 80:\n    print('جيد جداً')\nelse:\n    print('شد حيلك!')"
  },
  {
    id: LessonId.ForLoops,
    title: "4. حلقات For",
    content: "تُستخدم لتكرار كود معين لعدد محدد من المرات. مفيدة جداً عند التعامل مع القوائم.",
    defaultCode: "for i in range(1, 6):\n    print(f'هذا السطر يتكرر.. رقم {i}')"
  },
  {
    id: LessonId.WhileLoops,
    title: "5. حلقات While",
    content: "تكرر الكود طالما أن هناك شرطاً معيناً لا يزال صحيحاً. احذر من الحلقات اللا نهائية!",
    defaultCode: "energy = 3\nwhile energy > 0:\n    print(f'جاري العمل.. الطاقة المتبقية: {energy}')\n    energy -= 1\nprint('انتهت الطاقة!')"
  },
  {
    id: LessonId.ListsTuples,
    title: "6. القوائم والصفوف",
    content: "القوائم (Lists) تسمح لك بتخزين عناصر متعددة في متغير واحد. يمكنك الوصول للعنصر عن طريق رقمه (Index).",
    defaultCode: "colors = ['أحمر', 'أخضر', 'أزرق']\nprint(f'اللون الأول هو: {colors[0]}')\ncolors.append('أصفر')\nprint(colors)"
  },
  {
    id: LessonId.FunctionsMath,
    title: "7. الدوال والرياضيات",
    content: "الدالة هي مجموعة من الأوامر تقوم بمهمة محددة. نستخدمها لتنظيم الكود ومنع التكرار.",
    defaultCode: "def square(number):\n    return number * number\n\nresult = square(5)\nprint(f'مربع العدد 5 هو: {result}')"
  },
  {
    id: LessonId.ListMethods,
    title: "8. معالجة القوائم",
    content: "بايثون توفر دوال جاهزة للتعامل مع القوائم مثل الترتيب (sort) والعكس (reverse).",
    defaultCode: "numbers = [5, 2, 9, 1]\nnumbers.sort()\nprint(f'القائمة مرتبة: {numbers}')"
  },
  {
    id: LessonId.StdLib,
    title: "9. المكتبة القياسية",
    content: "بايثون تأتي بـ 'بطاريات مدمجة'. هناك آلاف المكتبات الجاهزة لمساعدتك، مثل مكتبة random للأرقام العشوائية.",
    defaultCode: "import random\n\nluck = random.randint(1, 10)\nprint(f'رقم حظك اليوم هو: {luck}')"
  },
  {
    id: LessonId.Project,
    title: "10. المشروع النهائي",
    content: "حان وقت التحدي! اجمع كل ما تعلمته لبناء برنامج صغير (مثل آلة حاسبة أو لعبة تخمين).",
    defaultCode: "# تحدي: اصنع برنامج يطلب رقمين ويجمعهما\nprint('--- آلة حاسبة بسيطة ---')\nx = 10\ny = 20\nprint(f'مجموع {x} و {y} هو: {x + y}')"
  }
];
