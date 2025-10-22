const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量读取配置
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ 缺少必要的环境变量')
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 使用服务角色密钥创建管理员客户端
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

const DEFAULT_ADMIN_PASSWORD = 'Admin123!'

async function fixCMSIssues() {
  console.log('🔧 开始修复CMS系统问题...\n')

  try {
    // 1. 创建管理员用户并设置权限
    console.log('1️⃣ 创建管理员用户...')
    
    // 首先检查是否已存在管理员用户
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    let adminUser = existingUser?.users?.find(u => u.email === 'admin@futuremind.com')

    if (!adminUser) {
      // 创建新的管理员用户
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@futuremind.com',
        password: DEFAULT_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: 'admin'
        }
      })
      
      if (createError) {
        console.error('创建用户失败:', createError.message)
      } else {
        adminUser = newUser.user
        console.log('✅ 管理员用户创建成功')
      }
    } else {
      console.log('✅ 管理员用户已存在，重置密码...')
      const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
        password: DEFAULT_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: adminUser.user_metadata?.full_name || 'admin'
        }
      })
      if (updateError) {
        console.error('重置管理员密码失败:', updateError.message)
      } else {
        console.log(`✅ 管理员密码已重置为默认值 ${DEFAULT_ADMIN_PASSWORD}`)
      }
    }

    // 2. 设置用户权限为content_admin
    if (adminUser) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          email: adminUser.email,
          full_name: adminUser.user_metadata?.full_name || 'admin',
          role: 'content_admin',
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('设置用户权限失败:', profileError.message)
      } else {
        console.log('✅ 管理员权限设置成功')
      }
    }

    // 3. 检查storage bucket
    console.log('\n2️⃣ 检查存储配置...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('获取存储桶失败:', bucketError.message)
    } else {
      const mediaBucket = buckets.find(b => b.name === 'media')
      if (mediaBucket) {
        console.log('✅ media存储桶存在')
      } else {
        console.log('⚠️ media存储桶不存在，需要在Supabase控制台创建')
      }
    }

    // 4. 测试数据库CRUD操作
    console.log('\n3️⃣ 测试数据库CRUD操作...')
    
    // 测试模块创建
    const testModuleKey = `test-module-${Date.now()}`
    const { data: moduleData, error: moduleError } = await supabase
      .from('content_module')
      .insert({
        key: testModuleKey,
        title: '测试模块',
        description: '这是一个测试模块',
        created_by: adminUser?.id
      })
      .select()
      .single()
    
    if (moduleError) {
      console.error('模块创建测试失败:', moduleError.message)
    } else {
      console.log('✅ 模块创建功能正常')
      
      // 测试模块更新
      const { error: updateError } = await supabase
        .from('content_module')
        .update({ title: '更新后的测试模块' })
        .eq('id', moduleData.id)
      
      if (updateError) {
        console.error('模块更新测试失败:', updateError.message)
      } else {
        console.log('✅ 模块更新功能正常')
      }
      
      // 清理测试数据
      await supabase.from('content_module').delete().eq('id', moduleData.id)
    }

    // 5. 测试文本文件处理
    console.log('\n4️⃣ 测试文本文件处理...')
    
    const testFilePath = 'C:\\Users\\heyongbin\\Desktop\\13141911.txt'
    
    if (fs.existsSync(testFilePath)) {
      try {
        const fileContent = fs.readFileSync(testFilePath, 'utf8')
        const fileSize = fs.statSync(testFilePath).size
        
        console.log(`✅ 文件读取成功: ${testFilePath}`)
        console.log(`📄 文件大小: ${(fileSize / 1024).toFixed(2)} KB`)
        console.log(`📝 内容预览: ${fileContent.substring(0, 100)}...`)
        
        // 模拟webhook处理
        const webhookData = {
          filename: path.basename(testFilePath),
          content: fileContent,
          size: fileSize,
          type: 'text/plain',
          processed_at: new Date().toISOString()
        }
        
        console.log('✅ 文本文件处理模拟成功')
        console.log('📤 Webhook数据准备完成，可以发送到N8N')
        
      } catch (error) {
        console.error('文件处理失败:', error.message)
      }
    } else {
      console.log('⚠️ 测试文件不存在:', testFilePath)
    }

    console.log('\n🎉 CMS系统问题修复完成！')
    console.log('\n🔑 登录信息:')
    console.log('邮箱: admin@futuremind.com')
    console.log(`密码: ${DEFAULT_ADMIN_PASSWORD}`)
    console.log('权限: content_admin')

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message)
    console.error(error.stack)
  }
}

// 运行修复脚本
fixCMSIssues()
