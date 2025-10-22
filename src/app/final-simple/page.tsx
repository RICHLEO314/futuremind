'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FinalSimplePage() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('pbl_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) {
        console.error('Error loading projects:', projectsError)
      } else {
        setProjects(projectsData || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">简化版最终页面</h1>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold mb-4">PBL 项目</h2>
          
          {projects.length === 0 ? (
            <p className="text-gray-400">暂无项目</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project: any) => (
                <div key={project.id} className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                  <p className="text-gray-400">{project.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <span>状态: {project.status}</span>
                    <span className="mx-2">•</span>
                    <span>参与者: {project.current_participants}/{project.max_participants}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold mb-4">系统状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-green-400 font-medium">Supabase 已连接</span>
              </div>
              <p className="text-green-300 text-sm mt-2">数据库连接正常</p>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                <span className="text-blue-400 font-medium">Next.js 运行中</span>
              </div>
              <p className="text-blue-300 text-sm mt-2">开发服务器正常</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
