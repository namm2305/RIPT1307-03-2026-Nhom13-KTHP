const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Question = require('./models/Question');
const Comment = require('./models/Comment');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        await User.deleteMany({});
        await Question.deleteMany({});
        await Comment.deleteMany({});
        console.log('Đã xóa dữ liệu cũ');

        const users = await User.create([
            {
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@ptit.edu.vn',
                password: '123456',
                role: 'student',
                faculty: 'Công nghệ thông tin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A'
            },
            {
                name: 'Trần Thị B',
                email: 'tranthib@ptit.edu.vn',
                password: '123456',
                role: 'student',
                faculty: 'Công nghệ thông tin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B'
            },
            {
                name: 'Lê Hoàng C',
                email: 'lehoangc@ptit.edu.vn',
                password: '123456',
                role: 'teacher',
                faculty: 'Công nghệ thông tin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C'
            },
            {
                name: 'Phạm Minh D',
                email: 'phamminhd@ptit.edu.vn',
                password: '123456',
                role: 'student',
                faculty: 'An toàn thông tin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D'
            }
        ]);
        console.log(`Đã tạo ${users.length} users`);

        const questions = await Question.create([
            {
                title: 'Làm sao để cấu hình Git push không bị lỗi Permission Denied trên Windows?',
                content: 'Em vừa tạo repo mới trên GitHub nhưng khi push code từ máy local lên thì bị báo lỗi quyền truy cập. Em đã thử dùng HTTPS và SSH nhưng đều không được. Mọi người có thể hướng dẫn em cách fix lỗi này không ạ?\n\nLỗi cụ thể:\n- Permission denied (publickey)\n- fatal: Could not read from remote repository',
                tags: ['Git', 'Windows'],
                author: users[0]._id,
                votes: 7,
                viewCount: 142
            },
            {
                title: 'Sửa lỗi trùng lặp cấu hình export (Duplicate export) trong Routes của UmiJS',
                content: 'Mọi người cho em hỏi lỗi này xử lý thế nào ạ? Em kiểm tra trong file routes.ts thấy có 2 export default cùng tên. Khi chạy npm start thì báo lỗi Duplicate export. Em đã thử xóa một cái nhưng lại bị lỗi khác.',
                tags: ['UmiJS', 'TypeScript', 'React'],
                author: users[1]._id,
                votes: 2,
                viewCount: 85
            },
            {
                title: 'Phân biệt giữa kiến trúc Hệ thống thông tin (HTTT) và Công nghệ phần mềm (CNPM)?',
                content: 'Thầy có giao bài tập phân tích so sánh hai định hướng này nhưng em vẫn chưa rõ cấu trúc thực tế của từng ngành. Ai có kinh nghiệm có thể chia sẻ giúp em không?\n\nCụ thể em muốn biết:\n1. Sự khác nhau về chương trình đào tạo\n2. Cơ hội việc làm sau khi ra trường\n3. Ngành nào phù hợp với người thích code hơn?',
                tags: ['HTTT', 'CNPM', 'Lý thuyết'],
                author: users[2]._id,
                votes: 15,
                viewCount: 310
            },
            {
                title: 'Cách lấy token và giải mã TLS Handshake trong Wireshark bài Lab 3 An toàn thông tin',
                content: 'Em đang làm bài Lab bảo mật hệ thống nhưng khi bắt gói tin TLS không thấy hiện Master Secret. Em đã cấu hình SSLKEYLOGFILE rồi nhưng vẫn không decrypt được. Ai đã làm xong bài này có thể hướng dẫn em không?',
                tags: ['Security', 'Wireshark', 'Lab'],
                author: users[3]._id,
                votes: 0,
                viewCount: 95
            }
        ]);
        console.log(`Đã tạo ${questions.length} questions`);

        const comments = await Comment.create([
            {
                content: 'Bạn thử kiểm tra lại SSH key đã cấu hình đúng chưa nhé. Vào Settings > SSH Keys trên GitHub để xem. Nếu chưa có thì chạy lệnh:\n\nssh-keygen -t ed25519 -C "email@example.com"\n\nSau đó copy key public vào GitHub.',
                question: questions[0]._id,
                author: users[1]._id,
                votes: 5
            },
            {
                content: 'Ngoài SSH key, bạn cũng nên kiểm tra xem có đang dùng đúng tài khoản Git không bằng lệnh:\n\ngit config user.email\ngit config user.name\n\nNếu sai thì set lại cho đúng.',
                question: questions[0]._id,
                author: users[2]._id,
                votes: 3
            },
            {
                content: 'Mình bổ sung thêm: nếu bạn dùng Windows thì nên cài Git Credential Manager, nó sẽ tự quản lý token cho bạn luôn.',
                question: questions[0]._id,
                author: users[3]._id,
                votes: 2
            },
            {
                content: 'HTTT thiên về phân tích nghiệp vụ, thiết kế hệ thống thông tin cho doanh nghiệp. CNPM thiên về kỹ thuật lập trình, kiến trúc phần mềm.\n\nNếu bạn thích code nhiều thì nên chọn CNPM. Nếu thích tư vấn giải pháp, quản lý dự án thì HTTT phù hợp hơn.',
                question: questions[2]._id,
                author: users[2]._id,
                votes: 10
            },
            {
                content: 'Mình đang học CNPM năm 3, chia sẻ thêm là CNPM sẽ học nhiều về Design Pattern, Testing, CI/CD. Cơ hội việc làm rất rộng.',
                question: questions[2]._id,
                author: users[0]._id,
                votes: 4
            }
        ]);
        console.log(`Đã tạo ${comments.length} comments`);

        const replyComments = await Comment.create([
            {
                content: 'Cảm ơn bạn, mình đã thử SSH key và fix được rồi!',
                question: questions[0]._id,
                author: users[0]._id,
                parentComment: comments[0]._id,
                votes: 1
            },
            {
                content: 'Git Credential Manager rất hữu ích, cảm ơn bạn đã chia sẻ!',
                question: questions[0]._id,
                author: users[0]._id,
                parentComment: comments[2]._id,
                votes: 0
            }
        ]);
        console.log(`Đã tạo ${replyComments.length} replies`);

        console.log('\n===== SEED HOÀN TẤT =====');
        console.log('\nTài khoản test (mật khẩu đều là 123456):');
        users.forEach(u => {
            console.log(`  - ${u.name} | ${u.email} | ${u.role}`);
        });
        console.log('\nID câu hỏi để test:');
        questions.forEach(q => {
            console.log(`  - ${q._id} | ${q.title.substring(0, 50)}...`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Lỗi seed:', error.message);
        process.exit(1);
    }
};

seedData();
