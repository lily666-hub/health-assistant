import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Users, FileText, TrendingUp, AlertCircle, Upload, Stethoscope } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const stats = [
    {
      name: '总患者数',
      value: '1,248',
      icon: Users,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: '今日诊断',
      value: '24',
      icon: FileText,
      change: '+8%',
      changeType: 'increase',
    },
    {
      name: '高风险患者',
      value: '156',
      icon: AlertCircle,
      change: '-3%',
      changeType: 'decrease',
    },
    {
      name: '诊断准确率',
      value: '94.2%',
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'increase',
    },
  ];

  const recentDiagnoses = [
    {
      id: '1',
      patientName: '张三',
      riskLevel: 'high',
      confidence: 0.92,
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: '2',
      patientName: '李四',
      riskLevel: 'medium',
      confidence: 0.85,
      date: '2024-01-14',
      status: 'completed',
    },
    {
      id: '3',
      patientName: '王五',
      riskLevel: 'very_high',
      confidence: 0.96,
      date: '2024-01-14',
      status: 'reviewed',
    },
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'very_high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low':
        return '低风险';
      case 'medium':
        return '中风险';
      case 'high':
        return '高风险';
      case 'very_high':
        return '极高风险';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              欢迎回来，{user.name}医生！
            </h1>
            <p className="mt-1 text-gray-600">
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}，祝您工作顺利！
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-500">所属医院</div>
              <div className="font-medium text-gray-900">{user.hospital_id}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {user.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="text-sm font-medium text-gray-500">
                    {stat.name}
                  </div>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Diagnoses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            最近诊断
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            最近完成的智能诊断记录
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  患者姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  风险等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  置信度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  诊断日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentDiagnoses.map((diagnosis) => (
                <tr key={diagnosis.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {diagnosis.patientName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(diagnosis.riskLevel)}`}>
                      {getRiskLevelText(diagnosis.riskLevel)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(diagnosis.confidence * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(diagnosis.date).toLocaleDateString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      diagnosis.status === 'completed' ? 'bg-green-100 text-green-800' :
                      diagnosis.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {diagnosis.status === 'completed' ? '已完成' :
                       diagnosis.status === 'reviewed' ? '已审核' : '草稿'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">
              添加新患者
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            创建新的患者档案，开始记录病历信息
          </p>
          <button 
            onClick={() => navigate('/patients/new')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            立即添加
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">
              上传医疗数据
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            上传医疗图片和检查报告，进行OCR识别
          </p>
          <button 
            onClick={() => navigate('/upload')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始上传
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">
              智能诊断
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            使用AI技术进行智能诊断和风险评估
          </p>
          <button 
            onClick={() => navigate('/diagnosis')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            开始诊断
          </button>
        </div>
      </div>
    </div>
  );
}