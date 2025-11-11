import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  FileText, 
  Camera, 
  Eye, 
  Download,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUploadStore } from '@/stores/uploadStore';
import { apiClient } from '@/services/api';
import { UploadFile, OCRResult } from '@/types';

interface UploadForm {
  patient_id: string;
  file_type: 'medical_record' | 'lab_report' | 'prescription' | 'other';
  description: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<UploadForm>();
  const {
    files,
    uploadProgress,
    ocrResults,
    loading: uploadLoading,
    addFile,
    removeFile,
    setUploadProgress,
    setOCRResult,
  } = useUploadStore();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`文件 ${file.name} 格式不支持`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`文件 ${file.name} 超过10MB限制`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (data: UploadForm) => {
    if (selectedFiles.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }

    try {
      setCurrentUploadIndex(0);
      
      for (let i = 0; i < selectedFiles.length; i++) {
        setCurrentUploadIndex(i);
        const file = selectedFiles[i];
        
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress(prevProgress => Math.min(prevProgress + 10, 90));
        }, 200);

        try {
          // 创建FormData并上传文件
          const formData = new FormData();
          formData.append('files', file);
          formData.append('patient_id', data.patient_id);
          formData.append('file_type', data.file_type);
          formData.append('description', data.description);

          // 上传文件
          const uploadResponse = await apiClient.uploadFiles(formData);

          clearInterval(progressInterval);
          setUploadProgress(100);

          if (uploadResponse.success && uploadResponse.data) {
            // 处理上传的文件数据
            const processedFiles = uploadResponse.data.files;
            processedFiles.forEach((processedFile: any) => {
              const uploadFile: UploadFile = {
                id: processedFile.file_id,
                name: processedFile.original_name,
                size: file.size,
                type: file.type,
                url: processedFile.file_url,
                upload_progress: 100,
                status: 'completed' as const,
              };
              addFile(uploadFile);
            });
            
            // 如果是图片或PDF，进行OCR识别
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
              toast.info(`正在对 ${file.name} 进行OCR识别...`);
              
              // 模拟OCR处理延迟
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // 创建OCR请求
              const ocrRequest = {
                files: [file],
                patient_id: data.patient_id,
                document_type: data.file_type,
              };
              
              const ocrResponse = await apiClient.processOCR(ocrRequest);
              
              if (ocrResponse.success && ocrResponse.data) {
                setOCRResult(file.name, ocrResponse.data);
                toast.success(`${file.name} OCR识别完成`);
              } else {
                toast.warning(`${file.name} OCR识别失败`);
              }
            }
          } else {
            toast.error(`${file.name} 上传失败: ${uploadResponse.error?.message}`);
          }
        } catch (error) {
          clearInterval(progressInterval);
          toast.error(`${file.name} 上传失败: 网络错误`);
        }
      }

      toast.success('所有文件上传完成！');
      setSelectedFiles([]);
      
    } catch (error) {
      toast.error('上传过程中发生错误');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`文件 ${file.name} 格式不支持`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`文件 ${file.name} 超过10MB限制`);
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Camera className="w-6 h-6 text-blue-600" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-600" />;
    }
    return <FileText className="w-6 h-6 text-gray-600" />;
  };

  const getFileStatusIcon = (index: number) => {
    const progress = uploadProgress[index] || 0;
    const ocrResult = ocrResults[index];
    
    if (progress === 100) {
      if (ocrResult) {
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      }
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    } else if (progress > 0) {
      return (
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据上传</h1>
          <p className="mt-1 text-sm text-gray-600">
            上传患者的医疗记录、检验报告等文档，支持OCR识别
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/patients')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            患者列表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">上传设置</h2>
          
          <form onSubmit={handleSubmit(handleUpload)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                患者ID *
              </label>
              <input
                {...register('patient_id', { required: '请选择患者' })}
                type="text"
                placeholder="输入患者ID或从患者列表选择"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文件类型
              </label>
              <select
                {...register('file_type')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="medical_record">病历记录</option>
                <option value="lab_report">检验报告</option>
                <option value="prescription">处方</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="添加文件描述（可选）"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择文件
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  拖拽文件到此处，或
                  <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                    点击选择文件
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">
                  支持 JPG、PNG、PDF 格式，单个文件最大 10MB
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedFiles.length === 0 || uploadLoading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadLoading ? '上传中...' : '开始上传'}
            </button>
          </form>
        </div>

        {/* File Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            文件预览 ({selectedFiles.length})
          </h2>
          
          {selectedFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">暂无选中的文件</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getFileStatusIcon(index)}
                    <button
                      onClick={() => handleFileRemove(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* OCR Results */}
      {ocrResults.some(result => result) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">OCR识别结果</h2>
            <button
              onClick={() => {
                // 清除OCR结果
                setSelectedFiles([]);
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              清除结果
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ocrResults.map((result, index) => (
              result && (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedFiles[index]?.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">识别成功</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {result.text || '暂无识别内容'}
                    </pre>
                  </div>
                  
                  {result.confidence && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>置信度</span>
                        <span>{result.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${result.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}