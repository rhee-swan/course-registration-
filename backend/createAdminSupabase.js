require('dotenv').config();
const { supabaseAdmin } = require('./config/supabase');

const createAdmin = async () => {
  try {
    console.log('Creating admin user in Supabase...');

    // Create admin user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: '관리자',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ 관리자 계정이 이미 존재합니다.');
        console.log('이메일: admin@example.com');
        return;
      }
      throw authError;
    }

    // Update user profile to admin role
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ role: 'admin' })
      .eq('id', authData.user.id);

    if (updateError) throw updateError;

    console.log('✅ 관리자 계정이 생성되었습니다!');
    console.log('이메일: admin@example.com');
    console.log('패스워드: admin123');
    console.log('\n⚠️  운영 환경에서는 반드시 패스워드를 변경하세요!');

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
    process.exit(1);
  }
};

createAdmin();
