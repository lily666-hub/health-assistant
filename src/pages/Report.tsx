import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Share2, 
  Printer,
  Eye,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useDiagnosisStore } from '@/stores/diagnosisStore';
import { apiClient } from '@/services/api';
import { DiagnosisReport } from '@/types';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentDiagnosis,
    diagnosisReports,
    setCurrentDiagnosis,
    loading,
    setLoading,
    error,
    setError,
  } = useDiagnosisStore();

  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'recommendations' | 'evidence'>('overview');

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.getDiagnosisReport(reportId);
      if (response.success && response.data) {
        setReport(response.data);
        setCurrentDiagnosis(response.data);
      } else {
        setError('获取诊断报告失败');
        toast.error('获取诊断报告失败');
      }
    } catch (error) {
      setError('网络错误，请检查连接');
      toast.error('获取诊断报告失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'json') => {
    if (!report) return;

    const data = format === 'pdf' 
      ? generatePDFData(report)
      : JSON.stringify(report, null, 2);

    const blob = new Blob([data], { 
      type: format === 'pdf' ? 'application/pdf' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnosis_report_${report.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`报告已导出为 ${format.toUpperCase()}`);
  };

  const generatePDFData = (report: DiagnosisReport): string => {
    // 简化的PDF数据生成（实际项目中可以使用专门的PDF库）
    return `
糖尿病智能诊断报告
===================

患者信息
--------
姓名: ${report.patient_name}
诊断时间: ${new Date(report.created_at).toLocaleString('zh-CN')}

诊断结果
--------
风险等级: ${getRiskLevelText(report.risk_level)}
诊断结论: ${report.diagnosis}

临床指标
--------
空腹血糖: ${report.clinical_data.fasting_glucose || report.clinical_data.blood_glucose?.fasting || '未提供'} mmol/L
糖化血红蛋白: ${report.clinical_data.blood_glucose?.hba1c || '未提供'} %
BMI: ${report.clinical_data.bmi || '未提供'}

建议
----
${report.recommendations.map(rec => `- ${rec.description}: ${rec.details || '暂无详细说明'}`).join('\n')}

免责声明
--------
本报告仅供参考，不能替代专业医生的诊断。请咨询专业医生获取准确的医疗建议。
    `;
  };

  const handleShare = () => {
    if (navigator.share && report) {
      navigator.share({
        title: '糖尿病诊断报告',
        text: `${report.patient_name || '患者'} 的诊断报告 - 风险等级: ${getRiskLevelText(report.risk_level)}`,
        url: window.location.href,
      }).catch(() => {
        // 用户取消分享
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      default: return '未知';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">加载中...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error || '报告不存在'}</p>
          <button
            onClick={() => navigate('/diagnosis')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回诊断页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">诊断报告</h1>
            <p className="mt-1 text-sm text-gray-600">
              报告ID: {report.id} | 生成时间: {formatDate(report.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Printer className="w-4 h-4 mr-1" />
              打印
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4 mr-1" />
              分享
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              导出PDF
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{report.patient_name || '患者'}</h2>
            <p className="text-sm text-gray-600">
              年龄: {report.clinical_data.age}岁 | 性别: {report.clinical_data.gender === 'male' ? '男' : '女'}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRiskLevelColor(report.risk_level)}`}>
              {getRiskLevelText(report.risk_level)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: '概览', icon: BarChart3 },
              { id: 'details', label: '详细信息', icon: FileText },
              { id: 'recommendations', label: '建议', icon: CheckCircle },
              { id: 'evidence', label: '依据', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">空腹血糖</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {report.clinical_data.fasting_glucose || report.clinical_data.blood_glucose?.fasting || 'N/A'} mmol/L
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">糖化血红蛋白</p>
                      <p className="text-2xl font-bold text-green-900">
                        {report.clinical_data.blood_glucose?.hba1c || 'N/A'} %
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <User className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">BMI</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {report.clinical_data.bmi || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">诊断时间</p>
                      <p className="text-sm font-bold text-purple-900">
                        {new Date(report.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">诊断结论</h3>
                <p className="text-gray-700">{report.main_diagnosis}</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">风险因素</h3>
                <ul className="text-yellow-800 space-y-1">
                  {(report.risk_factors || []).map((factor, index) => (
                    <li key={index} className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">临床指标</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">空腹血糖:</span>
                      <span className="font-medium">{report.clinical_data.blood_glucose?.fasting || '未提供'} mmol/L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">糖化血红蛋白:</span>
                      <span className="font-medium">{report.clinical_data.blood_glucose?.hba1c || '未提供'} %</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">BMI:</span>
                      <span className="font-medium">{report.clinical_data.bmi || '未提供'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">年龄:</span>
                      <span className="font-medium">{report.clinical_data.age || '未提供'}岁</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">性别:</span>
                      <span className="font-medium">{report.clinical_data.gender === 'male' ? '男' : '女'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">血压指标</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">收缩压:</span>
                      <span className="font-medium">{report.clinical_data.blood_pressure?.systolic || '未提供'} mmHg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">舒张压:</span>
                      <span className="font-medium">{report.clinical_data.blood_pressure?.diastolic || '未提供'} mmHg</span>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-3 mt-6">家族史</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600">家族糖尿病史:</span>
                    <span className="font-medium">{report.clinical_data.family_history ? '有' : '无'}</span>
                  </div>
                </div>
              </div>

              {report.clinical_data.symptoms && report.clinical_data.symptoms.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">症状</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.clinical_data.symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {report.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{rec.description}</h3>
                      <p className="text-gray-700 mb-2">{rec.details || '暂无详细说明'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>优先级: {rec.priority}</span>
                        <span>类型: {rec.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">诊断依据</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{report.reasoning_process}</p>
                </div>
              </div>

              {report.similar_cases && report.similar_cases.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">相似病例</h3>
                  <div className="space-y-3">
                    {report.similar_cases.map((case_, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">病例 {index + 1}</h4>
                          <span className="text-sm text-gray-500">
                            相似度: {(case_.similarity_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{case_.clinical_summary}</p>
                        <div className="text-sm text-gray-600">
                          <p>诊断: {case_.diagnosis}</p>
                          <p>结果: {case_.outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-yellow-900">重要声明</h3>
            <p className="text-yellow-800 text-sm mt-1">
              本诊断报告由AI系统生成，仅供参考。不能替代专业医生的诊断和治疗建议。
              如有疑问，请咨询专业医生获取准确的医疗建议。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}