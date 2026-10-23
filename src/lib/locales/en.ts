import { practiceEnglish } from "./practice-en";
import { advancedEnglish } from "./course-en";
// Vietnamese source strings are the stable catalog keys.
export const english: Record<string, string> = {
  "Đang kiểm tra đăng nhập…": "Checking sign-in…",
  "Đăng nhập Google chưa được bật. Bạn vẫn có thể học ở chế độ khách.":
    "Google sign-in is not enabled yet. You can keep learning as a guest.",
  "Chưa kết nối được dịch vụ đăng nhập. Hãy thử lại.":
    "Unable to reach the sign-in service. Please try again.",
  "Kiểm tra lại đăng nhập": "Check sign-in again",

  ...practiceEnglish,
  "Từ những nốt đầu đến bài luyện nâng cao.":
    "From your first notes to advanced practice.",
  "{count} bài học qua 4 cấp độ: Cơ bản, Nền tảng, Trung cấp và Nâng cao.":
    "{count} lessons across four levels: Beginner, Foundation, Intermediate, and Advanced.",
  "Tiếp tục hành trình": "Continue your journey",
  "Lọc theo cấp độ": "Filter by level",
  "Tất cả cấp độ": "All levels",
  "Cấp độ {level}": "Level {level}",
  "Hai tay": "Both hands",
  "Theo hướng dẫn": "See instructions",
  Lặng: "Rest",
  "Bắt đầu {start} BPM · Mục tiêu tham khảo {target} BPM · Nhịp {meter}/4":
    "Start at {start} BPM · Suggested target {target} BPM · {meter}/4 time",
  "Đang có dấu lặng: đếm đủ phách, rồi tiếp tục.":
    "This is a rest. Count its full length, then continue.",
  "Bấm và giữ đủ các nốt của cụm cùng lúc; thả các phím khác.":
    "Hold all notes of the group together and release any other keys.",
  "Tiếp tục chạm các nốt còn lại để ghép cụm.":
    "Tap the remaining notes to complete the group.",
  "Màn hình: chạm từng nốt để ghép cụm. MIDI: bấm và giữ đủ cụm cùng lúc, rồi thả trước cụm tiếp theo.":
    "On screen: tap each note to build a group. MIDI: hold the whole group together, then release before the next group.",
  "Đếm {beats} rồi tiếp tục.": "Count {beats}, then continue.",
  "Tiếp tục sau dấu lặng": "Continue after rest",
  "Nhịp máy đếm nhịp": "Metronome time signature",
  "Nhịp {meter}/4 · Chơi chậm và đều":
    "{meter}/4 time · Play slowly and steadily",
  ...advancedEnglish,
  "MIDI không khả dụng.": "MIDI is unavailable.",
  "Không tạo được MIDI client: ": "Unable to create MIDI client: ",
  "Không mở được MIDI input: ": "Unable to open MIDI input: ",
  "Dữ liệu xuất không hợp lệ.": "The export data is invalid.",
  "Không mở được chia sẻ.": "Unable to open sharing.",
  "Không xuất được tiến độ: ": "Unable to export progress: ",
  "{count} ngày liên tiếp": "{count} consecutive {day}",
  "{rounds} lượt · {correct} nốt đúng · {wrong} nốt cần sửa · Chấm cao độ; tự luyện nhịp theo mẫu.":
    "{rounds} {roundWord} · {correct} correct {correctWord} · {wrong} {wrongWord} to improve · Pitch feedback only; practice rhythm with the example.",
  "Tổng quan": "Overview",
  "Lộ trình học": "Learning path",
  "Phòng luyện tập": "Practice room",
  "Tiến độ của bạn": "Your progress",
  "Tài khoản & kết nối": "Account & connections",
  "Một chút piano, mỗi ngày.": "A little piano, every day.",
  "Cùng biến những nốt nhạc đầu tiên thành thói quen nhé.":
    "Turn your first notes into a daily habit.",
  "Những bước đầu cùng piano.": "Your first steps at the piano.",
  "8 bài học ngắn, từ phím đàn đầu tiên đến giai điệu và hợp âm.":
    "8 short lessons, from your first keys to melodies and chords.",
  "Không gian cho những nốt nhạc.": "A space for your music.",
  "Nghe mẫu, luyện nhịp và chơi trên chiếc Yamaha của bạn.":
    "Listen, practice your rhythm, and play on your Yamaha.",
  "Mỗi lần luyện, một bước tiến.": "Every practice is a step forward.",
  "Nhìn lại thời gian bạn đã dành cho âm nhạc.":
    "Look back at the time you have spent making music.",
  "Một hành trình, nhiều thiết bị.": "One journey, across your devices.",
  "Đăng nhập để mang tiến độ từ iPad sang iPhone và web.":
    "Sign in to take your progress between iPad, iPhone, and the web.",
  "Không khôi phục được đăng nhập. Hãy đăng nhập lại.":
    "Unable to restore your account. Please sign in again.",
  "Không đăng nhập được.": "Unable to sign in.",
  "Không kết nối được MIDI.": "Unable to connect to MIDI.",
  "Không xuất được tiến độ. Hãy thử lại.":
    "Unable to export your progress. Please try again.",
  "·": "·",
  "phút ·": "min ·",
  "Tay phải": "Right hand",
  "Tay trái": "Left hand",
  "Đã hoàn thành": "Completed",
  "Tiếp theo": "Up next",
  "Bài ": "Lesson ",
  "Đang chờ đàn MIDI. Kiểm tra dây USB và bật đàn.":
    "Waiting for your MIDI piano. Check the USB cable and turn on your piano.",
  "Kết nối để hiển thị nốt bạn bấm và luyện có phản hồi.":
    "Connect your piano to see the keys you play and practice with feedback.",
  "Đang kết nối…": "Connecting…",
  "Ngắt kết nối": "Disconnect",
  "Kết nối đàn MIDI": "Connect MIDI piano",
  "Trình duyệt này chưa hỗ trợ MIDI. Trên iPad/iPhone, dùng bản Phím iOS để kết nối đàn.":
    "This browser does not support MIDI. On iPad or iPhone, use the Phím iOS app to connect your piano.",
  "iPad Pro M2: USB-B → USB-C truyền dữ liệu.":
    "iPad Pro M2: USB-B → USB-C data cable.",
  "iPhone 11 Pro Max: USB-B → USB-A + Lightning Camera Adapter.":
    "iPhone 11 Pro Max: USB-B → USB-A + Lightning Camera Adapter.",
  "Đang bấm:": "Playing:",
  " · ": " · ",
  "Phím — Tổng quan": "Phím — Overview",
  phím: "phím",
  "TỪNG PHÍM ĐÀN, MỘT NIỀM VUI": "ONE KEY AT A TIME, ONE MOMENT OF JOY",
  "✧ Chậm thôi, nhưng đều đặn.": "✧ Take it slowly. Keep showing up.",
  "15 phút mỗi ngày là khởi đầu tốt để đôi tay làm quen với piano.":
    "15 minutes a day is a great start for getting comfortable at the piano.",
  Bạn: "You",
  "Người yêu piano": "Piano learner",
  "Tài khoản của bạn": "Your account",
  "Đang học ở chế độ khách": "Learning as a guest",
  "Không gian học tập /": "Learning space /",
  "ngày liên tiếp": "consecutive days",
  "Ẩn thông báo": "Dismiss notification",
  "Đang khôi phục tài khoản…": "Restoring your account…",
  "HÀNH TRÌNH CỦA BẠN BẮT ĐẦU TỪ ĐÂY": "YOUR JOURNEY STARTS HERE",
  "Đôi tay làm quen.": "Get to know the keys.",
  "Âm nhạc lên tiếng.": "Let the music begin.",
  "Không cần biết nhiều nhạc lý.": "No advanced music theory needed.",
  "Bắt đầu từ chiếc đàn bạn đang có.": "Start with the piano you already have.",
  "Tiếp tục bài học": "Continue learning",
  "Bắt đầu bài đầu tiên": "Start your first lesson",
  "♪": "♪",
  phút: "min",
  "Thời gian luyện tập": "Practice time",
  "Bài học hoàn thành": "Lessons completed",
  "Giai điệu đã học": "Melodies learned",
  "Lộ trình cho người mới": "A path for beginners",
  "Xem tất cả": "View all",
  "Chạm phím, nghe nốt nhạc": "Touch a key, hear a note",
  "Một quãng tám đầu tiên": "Your first octave",
  "Một thói quen nhỏ 🌱": "A small daily habit 🌱",
  "Mục tiêu hôm nay": "Today's goal",
  "/ 15 phút": "/ 15 min",
  "Buổi luyện 15 phút": "15-minute practice",
  "MỘT CHÚT CẢM HỨNG": "A LITTLE INSPIRATION",
  "“Bạn không cần chơi thật hay để bắt đầu. Bạn cần bắt đầu để chơi thật hay.”":
    "“You don't need to play well to start. You need to start to play well.”",
  "Một lời nhắc cho hôm nay": "A reminder for today",
  "Học theo thứ tự hoặc mở bất kỳ bài nào để ôn tập. Phím được đánh dấu giúp bạn tìm nốt, số ngón hướng dẫn cách chơi.":
    "Follow the lessons in order, or open any lesson to review. Highlighted keys show the notes; finger numbers guide your hands.",
  "MỘT BUỔI LUYỆN TRỌN VẸN": "A COMPLETE PRACTICE SESSION",
  "15 phút cùng chiếc đàn của bạn.": "15 minutes with your piano.",
  "3 phút khởi động · 5 phút luyện nhịp · 7 phút giai điệu":
    "3 min warm-up · 5 min rhythm · 7 min melody",
  "Bắt đầu buổi luyện": "Start a practice session",
  "Bàn phím tự do": "Free-play keyboard",
  "Chọn bài để luyện lại": "Choose a lesson to practice",
  ngày: "days",
  "Chuỗi ngày liên tiếp": "Consecutive practice days",
  "Nhật ký luyện tập": "Practice journal",
  "Xuất tiến độ": "Export progress",
  "Những nốt đầu tiên đang chờ bạn.": "Your first notes are waiting.",
  "Luyện một bài để bắt đầu nhật ký âm nhạc của mình.":
    "Practice a lesson to begin your music journal.",
  "Bắt đầu học": "Start learning",
  "Bài luyện": "Practice lesson",
  "Đàn MIDI": "MIDI piano",
  "Tự luyện trên đàn": "Practice on your piano",
  "Bàn phím màn hình": "On-screen keyboard",
  "Hoàn thành": "Complete",
  "Đã lưu buổi luyện": "Session saved",
  "Tiến độ đang lưu trên thiết bị.": "Your progress is saved on this device.",
  "Nhập tiến độ đã học ở chế độ khách": "Import progress from guest mode",
  "Chưa đăng xuất được. Hãy thử lại.": "Unable to sign out. Please try again.",
  "Đăng xuất": "Sign out",
  "Đăng nhập Google để đồng bộ bài học và buổi luyện giữa các thiết bị. Bạn vẫn có thể học ngay ở chế độ khách.":
    "Sign in with Google to sync lessons and practice sessions across devices. You can also start learning as a guest.",
  "Đang mở Google…": "Opening Google…",
  "Tiếp tục với Google": "Continue with Google",
  "Đăng nhập Google sẽ khả dụng khi hệ thống tài khoản được kết nối.":
    "Google sign-in will be available when the account service is configured.",
  "Chế độ khách lưu tiến độ trên trình duyệt này.":
    "Guest mode saves your progress in this browser.",
  "Tải bản sao tiến độ": "Download a copy of your progress",
  "Được thiết kế cho chiếc đàn của bạn": "Designed for your piano",
  "Yamaha YDP-163 · iPad Pro M2 · iPhone 11 Pro Max":
    "Yamaha YDP-163 · iPad Pro M2 · iPhone 11 Pro Max",
  "Web: bài học, âm thanh, máy đếm nhịp, tiến độ và đăng nhập.":
    "Web: lessons, audio, metronome, progress, and sign-in.",
  "iOS: thêm kết nối USB MIDI để nhận nốt từ đàn.":
    "iOS: adds USB MIDI to receive notes from your piano.",
  "Chấm MIDI hiện kiểm tra cao độ từng nốt; nhịp và tư thế cần tự luyện theo hướng dẫn.":
    "MIDI feedback checks individual note pitches. Practice rhythm and posture using the instructions.",
  "Phím không sử dụng micro để nghe tiếng đàn.":
    "Phím does not use the microphone to listen to your piano.",
  "Bạn đang dùng bản ứng dụng iOS.": "You are using the iOS app.",
  "Bạn đang dùng phiên bản web.": "You are using the web version.",
  "Đặt tay lên phím đàn. Dành một chút thời gian cho chính mình.":
    "Put your hands on the keys. Make a little time for yourself.",
  "Đăng nhập để đồng bộ tiến độ": "Sign in to sync your progress",
  "· Chạm phím để nghe": "· Touch a key to hear it",
  "Không bật được âm thanh. Hãy thử chạm lại.":
    "Unable to start audio. Please tap again.",
  "Máy đếm nhịp": "Metronome",
  "NHỊP / PHÚT": "BEATS / MINUTE",
  "Tốc độ máy đếm nhịp": "Metronome tempo",
  "Dừng lại": "Stop",
  "Bắt đầu": "Start",
  "Nhịp 4/4 · Chơi chậm và đều": "4/4 time · Play slowly and steadily",
  "Khởi động đôi tay": "Warm up your hands",
  "Chơi Đô – Rê – Mi – Fa – Sol rồi quay về, ngón tay cong nhẹ. Luyện từng tay và giữ vai thả lỏng.":
    "Play C – D – E – F – G and back, keeping your fingers gently curved. Practice one hand at a time and relax your shoulders.",
  "Luyện nhịp thật đều": "Practice a steady rhythm",
  "Đếm 1 – 2 – 3 – 4 ở tốc độ thoải mái. Chơi Đô mỗi phách, sau đó giữ Đô 2 phách và Rê 2 phách.":
    "Count 1 – 2 – 3 – 4 at a comfortable tempo. Play C on each beat, then hold C for 2 beats and D for 2 beats.",
  "Chơi giai điệu": "Play a melody",
  "Mi Mi Fa Sol | Sol Fa Mi Rê | Đô Đô Rê Mi | Mi (1½), Rê (½), Rê (2 phách). Luyện từng câu rồi ghép lại.":
    "E E F G | G F E D | C C D E | E (1½), D (½), D (2 beats). Practice each phrase, then join them together.",
  "Đóng buổi luyện": "Close practice session",
  "15 PHÚT CHO CHÍNH MÌNH": "15 MINUTES FOR YOURSELF",
  "Buổi luyện hôm nay": "Today's practice",
  "Đặt iPad cạnh đàn, chỉnh ghế thoải mái và bắt đầu.":
    "Place your iPad by the piano, adjust your seat, and get ready.",
  "✓": "✓",
  "THỜI GIAN CÒN LẠI": "TIME REMAINING",
  "Bạn đã dành 15 phút cho piano!": "You've spent 15 minutes at the piano!",
  "Ghi lại buổi luyện và dành một chút thời gian nghỉ cho đôi tay.":
    "Save your session and give your hands a short rest.",
  "Đây là buổi tự luyện, không tự chấm tiếng đàn. Đồng hồ tạm dừng khi bạn rời ứng dụng.":
    "This is a self-guided session; it does not grade your playing. The timer pauses when you leave the app.",
  "Lưu và nghỉ": "Save and rest",
  "Tạm dừng": "Pause",
  "Bắt đầu luyện": "Start practicing",
  "Ghi lại buổi luyện": "Save practice session",
  "Đàn đã ngắt kết nối. Kiểm tra dây USB hoặc chuyển sang tự luyện.":
    "Your piano has disconnected. Check the USB cable or switch to practice on your piano.",
  "Đúng rồi!": "That's right!",
  "Bạn đã chơi hết một lượt!": "You played the whole sequence!",
  "Không bật được âm thanh. Hãy chạm lại nút nghe mẫu.":
    "Unable to start audio. Please tap Listen to example again.",
  "Chưa lưu được buổi luyện. Hãy thử lại.":
    "Unable to save your practice session. Please try again.",
  "Đóng và lưu buổi luyện": "Close and save practice",
  "Luyện theo từng nốt": "Practice one note at a time",
  "Cách luyện tập": "Practice mode",
  "(chưa kết nối)": "(not connected)",
  phách: "beats",
  "Mẫu luyện tập": "Practice pattern",
  "Nốt tiếp theo": "Next note",
  Ngón: "Finger",
  "Dừng mẫu": "Stop example",
  "Nghe mẫu": "Listen to example",
  "Tốc độ nghe mẫu": "Example tempo",
  "Hãy chơi nốt được đánh dấu.": "Play the highlighted note.",
  "Bấm Bắt đầu luyện để ghi thời gian thực hành.":
    "Tap Start practicing to record your practice time.",
  "lượt ·": "rounds ·",
  "nốt đúng ·": "correct notes ·",
  "nốt cần sửa · Chấm cao độ; tự luyện nhịp theo mẫu.":
    "notes to improve · Pitch feedback only; practice rhythm with the example.",
  "Tôi đã luyện mẫu này trên đàn thật (ít nhất 1 phút).":
    "I have practiced this pattern on my piano (for at least 1 minute).",
  "Luyện lại mẫu": "Restart pattern",
  "Kiểm tra nhanh": "Quick check",
  "Chính xác!": "Correct!",
  "Thử lại nhé. Xem phần hướng dẫn phía trên.":
    "Try again. Check the instructions above.",
  "Đang lưu…": "Saving…",
  "Hoàn thành bài": "Complete lesson",
  "Hoàn thành một lượt luyện (hoặc xác nhận tự luyện ít nhất 1 phút) và trả lời đúng câu hỏi để hoàn thành bài.":
    "Play one full sequence (or confirm at least 1 minute of practice on your piano) and answer the question correctly to complete this lesson.",
  "Làm quen với phím đàn": "Getting to know the keys",
  "Khám phá bàn phím": "Explore the keyboard",
  "Tìm nốt Đô trên đàn của bạn và làm quen với 5 phím trắng đầu tiên.":
    "Find C on your piano and get comfortable with your first five white keys.",
  "Phím đen lặp lại theo nhóm 2 và nhóm 3. Đô là phím trắng ngay bên trái nhóm 2 phím đen.":
    "Black keys repeat in groups of two and three. C is the white key immediately to the left of a group of two black keys.",
  "Tìm Đô giữa (C4, MIDI 60), gần giữa bàn phím. Bạn có thể nghe mẫu để đối chiếu.":
    "Find middle C (C4, MIDI 60), near the center of the keyboard. Listen to the example to compare.",
  "Tay phải: ngón cái trên Đô, ngón trỏ trên Rê, ngón giữa trên Mi, ngón áp út trên Fa, ngón út trên Sol.":
    "Right hand: thumb on C, index finger on D, middle finger on E, ring finger on F, and little finger on G.",
  "Chơi Đô – Rê – Mi – Fa – Sol rồi quay về. Thả lỏng vai, chơi chậm 5 lần.":
    "Play C – D – E – F – G and back. Relax your shoulders and repeat slowly five times.",
  "Nốt Đô nằm ở đâu?": "Where is C on the keyboard?",
  "Bên trái nhóm 2 phím đen": "To the left of two black keys",
  "Bên phải nhóm 3 phím đen": "To the right of three black keys",
  "Trên một phím đen": "On a black key",
  "Đặt tay và luyện 5 ngón": "Hand position and five fingers",
  "Kỹ thuật cơ bản": "Basic technique",
  "Tạo tư thế thoải mái, giữ cổ tay tự nhiên và các ngón cong nhẹ.":
    "Find a comfortable posture, with a natural wrist position and gently curved fingers.",
  "Ngồi giữa đàn, điều chỉnh ghế để khuỷu tay gần ngang phím. Thả lỏng vai.":
    "Sit at the center of the piano. Adjust your seat so your elbows are roughly level with the keys. Relax your shoulders.",
  "Đánh số ngón: cái 1, trỏ 2, giữa 3, áp út 4, út 5; giống nhau ở cả hai tay.":
    "Finger numbers: thumb 1, index 2, middle 3, ring 4, little finger 5. The numbers are the same for both hands.",
  "Tay phải chơi Đô – Mi – Rê – Fa – Mi – Sol, mỗi nốt dùng ngón tương ứng.":
    "With your right hand, play C – E – D – F – E – G using the corresponding fingers.",
  "Chơi chậm và đều; nghỉ khi tay mỏi hoặc khó chịu. Không cố kéo giãn ngón.":
    "Play slowly and steadily. Rest if your hands feel tired or uncomfortable. Do not force your fingers to stretch.",
  "Ngón cái được đánh số mấy?": "What number is the thumb?",
  "Giữ nhịp thật đều": "Keeping a steady beat",
  "Nhịp & tiết tấu": "Beat & rhythm",
  "Làm quen với nhịp 4/4 ở 60 BPM: mỗi tiếng click ứng với một phách.":
    "Get to know 4/4 time at 60 BPM: each click is one beat.",
  "Bật máy đếm nhịp ở 60 BPM, đếm 1 – 2 – 3 – 4 theo tiếng click.":
    "Set the metronome to 60 BPM. Count 1 – 2 – 3 – 4 with the clicks.",
  "Vỗ tay 1 lần mỗi phách trong 4 ô nhịp.":
    "Clap once per beat for four measures.",
  "Chơi 4 nốt Đô, mỗi nốt dài 1 phách (nốt đen).":
    "Play C four times, with each note lasting one beat (a quarter note).",
  "Chơi Đô giữ 2 phách, Rê giữ 2 phách (nốt trắng). Sau đó chơi Mi giữ 4 phách (nốt tròn).":
    "Hold C for two beats and D for two beats (half notes). Then hold E for four beats (a whole note).",
  "Trong nhịp 4/4, nốt trắng dài bao nhiêu phách?":
    "In 4/4 time, how many beats does a half note last?",
  "1 phách": "1 beat",
  "2 phách": "2 beats",
  "4 phách": "4 beats",
  "Giai điệu đầu tiên: Ode to Joy": "Your first melody: Ode to Joy",
  "Giai điệu": "Melody",
  "Chơi câu mở đầu của Ode to Joy bằng 5 ngón tay phải.":
    "Play the opening phrase of Ode to Joy with your five right-hand fingers.",
  "Đặt tay phải trên Đô – Rê – Mi – Fa – Sol, ngón 1 đến 5.":
    "Place your right-hand fingers 1 to 5 on C – D – E – F – G.",
  "Câu 1: Mi Mi Fa Sol | Sol Fa Mi Rê. Mỗi nốt dài 1 phách.":
    "Phrase 1: E E F G | G F E D. Each note lasts one beat.",
  "Câu 2: Đô Đô Rê Mi | Mi (1½ phách), Rê (½ phách), Rê (2 phách).":
    "Phrase 2: C C D E | E (1½ beats), D (½ beat), D (2 beats).",
  "Luyện từng câu ở 60 BPM. Nghe mẫu rồi ghép cả hai câu.":
    "Practice each phrase at 60 BPM. Listen to the example, then join the two phrases.",
  "Câu mở đầu bắt đầu bằng nốt nào?": "Which note starts the opening phrase?",
  Đô: "C",
  "Làm quen với tay trái": "Getting to know your left hand",
  "Tay trái tạo nền cho giai điệu. Hãy luyện riêng từng tay trước.":
    "Your left hand supports the melody. Practice each hand separately first.",
  "Tìm Đô thấp hơn Đô giữa 1 quãng tám (C3). Đặt ngón út tay trái (5) lên Đô.":
    "Find C one octave below middle C (C3). Place your left little finger (5) on C.",
  "Các ngón 4, 3, 2, 1 lần lượt trên Rê, Mi, Fa, Sol.":
    "Place fingers 4, 3, 2, and 1 on D, E, F, and G respectively.",
  "Chơi Đô – Rê – Mi – Fa – Sol rồi quay về thật chậm.":
    "Play C – D – E – F – G and back, very slowly.",
  "Sau khi quen: tay trái giữ Đô 4 phách, tay phải chơi Đô – Rê – Mi – Fa. Đây là bài tự luyện trên đàn thật.":
    "When comfortable, hold C for four beats in the left hand while the right hand plays C – D – E – F. Practice this on your piano.",
  "Ngón nào của tay trái chơi Đô ở vị trí này?":
    "Which left-hand finger plays C in this position?",
  "Ngón cái (1)": "Thumb (1)",
  "Ngón út (5)": "Little finger (5)",
  "Ngón giữa (3)": "Middle finger (3)",
  "Hợp âm Đô trưởng": "Your first C major chord",
  "Hợp âm": "Chords",
  "Ba nốt Đô – Mi – Sol tạo nên hợp âm Đô trưởng.":
    "The three notes C – E – G form a C major chord.",
  "Tìm Đô – Mi – Sol trên đàn. Tay phải dùng ngón 1 – 3 – 5.":
    "Find C – E – G. Use right-hand fingers 1 – 3 – 5.",
  "Luyện rải hợp âm: Đô – Mi – Sol – Mi, mỗi nốt dài 1 phách.":
    "Play a broken chord: C – E – G – E, one note per beat.",
  "Sau đó chơi 3 nốt cùng lúc trên đàn thật, giữ 4 phách rồi thả.":
    "Then play all three notes together on your piano, hold for four beats, and release.",
  "Lặp lại chậm 4 lần. Phần luyện có phản hồi bên dưới chấm từng nốt của hợp âm rải.":
    "Repeat slowly four times. The practice below checks individual notes of the broken chord.",
  "Hợp âm Đô trưởng gồm các nốt nào?": "Which notes make a C major chord?",
  "Đô – Rê – Mi": "C – D – E",
  "Rê – Fa – La": "D – F – A",
  "Đô – Mi – Sol": "C – E – G",
  "Twinkle, Twinkle: câu đầu": "Twinkle, Twinkle: the first phrase",
  "Thêm một giai điệu quen thuộc; ngón út cần chuyển nhẹ từ Sol sang La.":
    "Try another familiar melody. Move your hand gently to take the little finger from G to A.",
  "Bắt đầu với tay phải trên Đô – Rê – Mi – Fa – Sol.":
    "Start with your right hand on C – D – E – F – G.",
  "Chơi Đô Đô Sol Sol | La La Sol (giữ 2 phách). Khi chơi La, chuyển tay nhẹ sang phải.":
    "Play C C G G | A A G (hold for two beats). Move your hand gently to the right to play A.",
  "Tiếp: Fa Fa Mi Mi | Rê Rê Đô (giữ 2 phách). Trở về vị trí ban đầu.":
    "Continue: F F E E | D D C (hold for two beats). Return to your starting position.",
  "Luyện từng câu. Không với ngón hoặc căng tay để chạm nốt La.":
    "Practice one phrase at a time. Do not strain your hand or reach too far to play A.",
  "Nốt cuối của câu đầu được giữ bao lâu?":
    "How long do you hold the last note of the first phrase?",
  "½ phách": "½ beat",
  "Ôn tập và luyện đều": "Review and build consistency",
  "Củng cố": "Review",
  "Kết hợp kiểm soát ngón và độ dài nốt ở tốc độ chậm.":
    "Combine finger control and note lengths at a slow tempo.",
  "Khởi động 1 phút với Đô – Rê – Mi – Fa – Sol.":
    "Warm up for one minute with C – D – E – F – G.",
  "Chơi mẫu bên dưới, chú ý nốt dài 2 phách.":
    "Play the pattern below, paying attention to notes that last two beats.",
  "Luyện một lượt không nhìn tay. Nếu mất vị trí, dừng và đặt lại tay.":
    "Try a round without looking at your hands. If you lose your place, stop and reset your hand position.",
  "Ghi lại buổi luyện. Chỉ tăng 5 BPM khi bạn chơi thoải mái và đều.":
    "Save your session. Increase the tempo by just 5 BPM when your playing feels comfortable and steady.",
  "Khi chơi chưa đều, bạn nên làm gì?":
    "What should you do when your playing is uneven?",
  "Tăng tốc ngay": "Speed up immediately",
  "Giảm tốc và luyện từng đoạn": "Slow down and practice short sections",
  "Nhấn phím mạnh hơn": "Press the keys harder",
  "Đô♯": "C♯",
  Rê: "D",
  "Rê♯": "D♯",
  "Fa♯": "F♯",
  "Sol♯": "G♯",
  "La♯": "A♯",
  "C♯": "C♯",
  "D♯": "D♯",
  "F♯": "F♯",
  "G♯": "G♯",
  "A♯": "A♯",
  "Đăng nhập chưa được cấu hình. Bạn vẫn có thể luyện ở chế độ khách.":
    "Sign-in is not configured yet. You can still practice as a guest.",
  "Đăng nhập không thành công.": "Sign-in was unsuccessful.",
  "Đang đồng bộ…": "Syncing…",
  "Chưa đồng bộ được. Tiến độ vẫn được lưu trên thiết bị.":
    "Unable to sync. Your progress is still saved on this device.",
  "Chưa đồng bộ": "Not synced",
  "Thiết bị không cho phép lưu tiến độ.":
    "This device does not allow progress to be saved.",
  "Không tải được tiến độ lên tài khoản.":
    "Unable to upload your progress to your account.",
  "Đã đồng bộ": "Synced",
  "Không lưu được trên thiết bị. Hãy bật lưu trữ trình duyệt.":
    "Unable to save on this device. Please enable browser storage.",
  "Tiến độ đã lưu trên thiết bị; sẽ thử đồng bộ ở lần mở tiếp theo.":
    "Progress is saved on this device. Sync will be retried the next time you open the app.",
  "Không lưu được tiến độ.": "Unable to save your progress.",
  "Chưa đồng bộ được dữ liệu nhập.": "Unable to sync the imported progress.",
  "Safari chưa hỗ trợ MIDI. Hãy dùng ứng dụng Phím iOS hoặc trình duyệt hỗ trợ Web MIDI trên máy tính.":
    "Safari does not support MIDI. Use the Phím iOS app or a browser with Web MIDI support on a computer.",
  Sol: "G",
  Mi: "E",
  Fa: "F",
  La: "A",
  Si: "B",
  "Bạn chơi {played}. Hãy tìm {expected}.":
    "You played {played}. Try {expected}.",
  " · {accuracy}% nốt đúng": " · {accuracy}% correct notes",
  "Ngôn ngữ": "Language",
  "Tiếng Việt": "Tiếng Việt",
  English: "English",
  "Phím · Học piano mỗi ngày": "Phím · Learn piano every day",
  "Học piano mỗi ngày với bài luyện có hướng dẫn, máy đếm nhịp và Yamaha MIDI trên iOS.":
    "Learn piano every day with guided practice, a metronome, and Yamaha MIDI on iOS.",
};
