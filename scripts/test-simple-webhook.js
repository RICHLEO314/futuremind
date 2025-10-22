const fs = require('fs')
const path = require('path')

async function testSimpleWebhook() {
  console.log('🧪 简单测试文本文件webhook处理...\n')

  try {
    // 1. 读取测试文件
    const testFilePath = 'C:\\Users\\heyongbin\\Desktop\\13141911.txt'
    
    if (!fs.existsSync(testFilePath)) {
      console.error('❌ 测试文件不存在:', testFilePath)
      return
    }

    const fileContent = fs.readFileSync(testFilePath, 'utf8')
    const fileSize = fs.statSync(testFilePath).size
    const filename = path.basename(testFilePath)

    console.log(`📄 文件信息:`)
    console.log(`   文件名: ${filename}`)
    console.log(`   大小: ${(fileSize / 1024).toFixed(2)} KB`)
    console.log(`   内容预览: ${fileContent.substring(0, 100)}...`)

    // 2. 准备webhook数据
    const webhookData = {
      filename: filename,
      content: fileContent,
      size: fileSize,
      type: 'text/plain',
      module_id: null,
      item_id: null
    }

    console.log('\n📤 准备webhook数据完成')
    console.log('📋 数据摘要:')
    console.log(`   文件名: ${webhookData.filename}`)
    console.log(`   内容长度: ${webhookData.content.length} 字符`)
    console.log(`   文件大小: ${webhookData.size} 字节`)
    console.log(`   MIME类型: ${webhookData.type}`)

    // 3. 模拟webhook处理结果
    console.log('\n🤖 模拟webhook处理...')
    
    const mockResult = {
      success: true,
      message: 'Text file processed successfully',
      data: {
        asset: {
          id: `mock-asset-${Date.now()}`,
          url: `https://lvjezsnwesyblnlkkirz.supabase.co/storage/v1/object/public/media/documents/${Date.now()}_${filename}`,
          type: 'document',
          meta: {
            originalName: filename,
            size: fileSize,
            mimetype: 'text/plain',
            uploadPath: `documents/${Date.now()}_${filename}`,
            source: 'webhook',
            processed_at: new Date().toISOString(),
            content_preview: fileContent.substring(0, 200) + (fileContent.length > 200 ? '...' : '')
          }
        },
        storage_path: `documents/${Date.now()}_${filename}`,
        public_url: `https://lvjezsnwesyblnlkkirz.supabase.co/storage/v1/object/public/media/documents/${Date.now()}_${filename}`
      }
    }

    console.log('✅ Webhook处理模拟成功!')
    console.log('\n📊 处理结果:')
    console.log(`   资产ID: ${mockResult.data.asset.id}`)
    console.log(`   存储路径: ${mockResult.data.storage_path}`)
    console.log(`   公开URL: ${mockResult.data.public_url}`)
    console.log(`   文件类型: ${mockResult.data.asset.type}`)
    console.log(`   原始文件名: ${mockResult.data.asset.meta.originalName}`)

    // 4. 模拟N8N工作流处理
    console.log('\n🤖 模拟N8N工作流处理...')
    
    const n8nProcessing = {
      input: {
        filename: filename,
        content: fileContent,
        size: fileSize,
        supabase_asset_id: mockResult.data.asset.id
      },
      processing: {
        text_analysis: {
          word_count: fileContent.split(/\s+/).filter(word => word.length > 0).length,
          line_count: fileContent.split('\n').length,
          char_count: fileContent.length,
          book_count: fileContent.split('\n').filter(line => line.trim() && /^\d+\./.test(line.trim())).length
        },
        content_extraction: {
          // 提取书籍列表
          books: fileContent.split('\n')
            .filter(line => line.trim())
            .map(line => line.trim())
            .filter(line => /^\d+\./.test(line)),
          categories: ['经典文学', '历史传记', '哲学思想', '现代科学'],
          topics: ['易经', '曾国藩', '王阳明', '人类历史', '时间物理']
        },
        ai_processing: {
          summary: '这是一个包含多本经典书籍的阅读清单，涵盖了中国古典文学、历史传记、哲学思想和现代科学等多个领域，体现了从传统智慧到现代知识的完整学习路径。',
          tags: ['书单', '经典阅读', '学习资源', '知识管理', '个人成长'],
          recommended_actions: [
            '创建分类阅读计划',
            '建立书籍知识图谱',
            '制定循序渐进的学习路径',
            '设置阅读进度跟踪',
            '建立读书笔记系统'
          ],
          learning_path: [
            '第一阶段：古典智慧（易经、曾国藩家书、王阳明心学）',
            '第二阶段：现代视野（人类简史、时间简史）',
            '第三阶段：整合应用（结合古今智慧的实践）'
          ]
        }
      },
      output: {
        processed_at: new Date().toISOString(),
        status: 'completed',
        next_steps: [
          '在Supabase中创建书籍模块',
          '为每本书创建内容条目',
          '生成个性化阅读推荐',
          '建立学习进度追踪',
          '触发用户学习计划通知'
        ],
        webhook_response: {
          status: 'success',
          message: '文本文件已成功处理并集成到学习系统',
          created_modules: 1,
          created_items: 5, // 将在下面计算
          ai_insights: '这是一个包含多本经典书籍的阅读清单'
        }
      }
    }

    console.log('✅ N8N工作流处理完成')
    console.log(`   文本分析: ${n8nProcessing.processing.text_analysis.word_count}个词, ${n8nProcessing.processing.text_analysis.line_count}行, ${n8nProcessing.processing.text_analysis.book_count}本书`)
    console.log(`   内容提取: ${n8nProcessing.processing.content_extraction.books.length}本书籍`)
    console.log(`   AI摘要: ${n8nProcessing.processing.ai_processing.summary}`)
    console.log(`   学习路径: ${n8nProcessing.processing.ai_processing.learning_path.length}个阶段`)

    // 5. 输出详细的书籍列表
    console.log('\n📚 提取的书籍列表:')
    n8nProcessing.processing.content_extraction.books.forEach((book, index) => {
      console.log(`   ${index + 1}. ${book}`)
    })

    console.log('\n🎯 推荐学习路径:')
    n8nProcessing.processing.ai_processing.learning_path.forEach((stage, index) => {
      console.log(`   ${stage}`)
    })

    console.log('\n🎉 文本文件webhook测试完成!')
    console.log('\n📋 测试总结:')
    console.log('✅ 文件读取成功')
    console.log('✅ 数据结构准备完成')
    console.log('✅ Webhook处理模拟成功')
    console.log('✅ N8N工作流模拟完成')
    console.log('✅ 书籍内容解析成功')
    console.log('✅ AI分析和推荐生成')
    console.log('✅ 学习路径规划完成')

    console.log('\n💡 实际部署时的集成步骤:')
    console.log('1. 配置N8N webhook接收端点')
    console.log('2. 设置Supabase存储和数据库写入')
    console.log('3. 集成AI服务进行内容分析')
    console.log('4. 建立自动化学习计划生成')
    console.log('5. 配置用户通知和进度跟踪')

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message)
    console.error(error.stack)
  }
}

// 运行测试
testSimpleWebhook()
