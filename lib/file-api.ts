import type { UploadFile, UploadFileRequest } from '@/lib/types'

// 文件上传API
export const fileApi = {
  // 上传文件
  async uploadFile(formData: FormData): Promise<UploadFile> {
    const token = localStorage.getItem('admin_token')
    
    const response = await fetch('http://localhost:3010/api/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '文件上传失败')
    }

    return response.json()
  },

  // 获取我的文件列表
  async getMyFiles(params?: {
    page?: number
    limit?: number
    type?: string
  }): Promise<{ data: UploadFile[]; meta: any }> {
    const token = localStorage.getItem('admin_token')
    const query = new URLSearchParams()
    
    if (params?.page) query.append('page', params.page.toString())
    if (params?.limit) query.append('limit', params.limit.toString())
    if (params?.type) query.append('type', params.type)

    const response = await fetch(`http://localhost:3010/api/v1/uploads/my-files?${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取文件列表失败')
    }

    return response.json()
  },

  // 删除文件
  async deleteFile(fileId: number): Promise<void> {
    const token = localStorage.getItem('admin_token')
    
    const response = await fetch(`http://localhost:3010/api/v1/uploads/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('删除文件失败')
    }
  },

  // 获取文件信息
  async getFileInfo(fileId: number): Promise<UploadFile> {
    const token = localStorage.getItem('admin_token')
    
    const response = await fetch(`http://localhost:3010/api/v1/uploads/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取文件信息失败')
    }

    return response.json()
  }
}