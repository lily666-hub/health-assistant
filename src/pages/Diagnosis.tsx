import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Brain, 
  Eye, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useDiagnosisStore } from '@/stores/diagnosisStore';
import { usePatientStore } from '@/stores/patientStore';
import { apiClient } from '@/services/api';
import { DiagnosisReport, Patient, ClinicalData } from '@/types';

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const { 
    currentDiagnosis,
    diagnosisReports,
    clinicalData,
    loading,
    error,
    setCurrentDiagnosis,
    setLoading,
    setError,
    addDiagnosisReport,
  } = useDiagnosisStore();

  const { patients } = usePatientStore();
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clinicalInputs, setClinicalInputs] = useState({
    age: '',
    gender: 'male',
    bmi: '',
    fasting_glucose: '',
    postprandial_glucose: '',
    hba1c: '',
    systolic_bp: '',
    diastolic_bp: '',
    family_history: false,
    symptoms: [] as string[],
  });

  const [diagnosisMode, setDiagnosisMode] = useState<'manual' | 'rag'>('rag');
  const [searchQuery, setSearchQuery] = useState('');

  const symptoms = [
    '多饮', '多尿', '多食', '体重下降', '疲劳', '视力模糊',
    '伤口愈合缓慢', '皮肤瘙痒', '手足麻木', '反复感染'
  ];

  useEffect(() => {
    if (patients.length === 0) {
      // 如果患者列表为空，可以在这里加载
    }
  }, [patients]);

  const handleSymptomToggle = (symptom: string) => {
    setClinicalInputs(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setClinicalInputs(prev => ({
      ...prev,
      age: patient.age.toString(),
      gender: patient.gender,
    }));
  };

  const handleDiagnosis = async () => {
    if (!selectedPatient) {
      toast.error('请选择患者');
      return;
    }

    if (!clinicalInputs.age || !clinicalInputs.fasting_glucose || !clinicalInputs.hba1c) {
      toast.error('请填写必要的临床数据');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const clinicalData: ClinicalData = {
        id: `clinical_${Date.now()}`,
        patient_id: selectedPatient.id,
        measurement_date: new Date(),
        age: parseInt(clinicalInputs.age),
        gender: clinicalInputs.gender as 'male' | 'female',
        bmi: clinicalInputs.bmi ? parseFloat(clinicalInputs.bmi) : undefined,
        fasting_glucose: parseFloat(clinicalInputs.fasting_glucose),
        postprandial_glucose: clinicalInputs.postprandial_glucose ? parseFloat(clinicalInputs.postprandial_glucose) : undefined,
        hba1c: parseFloat(clinicalInputs.hba1c),
        systolic_bp: clinicalInputs.systolic_bp ? parseInt(clinicalInputs.systolic_bp) : undefined,
        diastolic_bp: clinicalInputs.diastolic_bp ? parseInt(clinicalInputs.diastolic_bp) : undefined,
        family_history: clinicalInputs.family_history,
        symptoms: clinicalInputs.symptoms,
        created_at: new Date(),
        // updated_at: new Date(),
      };

      const response = await apiClient.performDiagnosis({
        patient_id: selectedPatient.id,
        clinical_data: clinicalData,
        mode: diagnosisMode,
        search_query: diagnosisMode === 'rag' ? searchQuery : undefined,
      });

      if (response.success && response.data) {
        const diagnosisReport: DiagnosisReport = {
          ...response.data,
          id: response.data.diagnosis_id,
          patient_id: selectedPatient.id,
          doctor_id: 'system',
          report_date: new Date(),
          diagnosis_type: diagnosisMode,
          status: 'finalized',
          created_at: new Date(),
          updated_at: new Date(),
          risk_level: response.data.risk_assessment.overall_risk,
          main_diagnosis: '基于临床数据的智能诊断结果',
          differential_diagnosis: [],
          evidence: [],
        };
        setCurrentDiagnosis(diagnosisReport);
        addDiagnosisReport(diagnosisReport);
        
        toast.success('诊断完成！');
        
        // 导航到报告页面
        navigate(`/diagnosis/${diagnosisReport.id}`);
      } else {
        setError(response.error?.message || '诊断失败');
        toast.error('诊断失败：' + (response.error?.message || '未知错误'));
      }
    } catch (error) {
      setError('网络错误，请检查连接');
      toast.error('诊断失败：网络错误');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">智能诊断</h1>
          <p className="mt-1 text-sm text-gray-600">
            基于临床数据和医学知识库进行智能诊断分析
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/diagnosis/history')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Clock className="w-4 h-4 mr-2" />
            诊断历史
          </button>
        </div>
      </div>

      {/* Diagnosis Mode Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">诊断模式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setDiagnosisMode('manual')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              diagnosisMode === 'manual' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <Brain className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">传统诊断模式</h3>
            </div>
            <p className="text-sm text-gray-600">
              基于临床指标和诊断标准进行传统诊断分析
            </p>
          </div>
          
          <div
            onClick={() => setDiagnosisMode('rag')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              diagnosisMode === 'rag' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <Search className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">RAG智能诊断</h3>
            </div>
            <p className="text-sm text-gray-600">
              结合医学知识库和相似病例进行智能诊断
            </p>
          </div>
        </div>

        {diagnosisMode === 'rag' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              相关症状或病史描述（用于知识库检索）
            </label>
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="请输入患者的症状、病史或其他相关信息..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">选择患者</h2>
          
          {selectedPatient ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPatient.age}岁 · {selectedPatient.gender === 'male' ? '男' : '女'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  更换
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="搜索患者姓名..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {patients.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">
                          {patient.age}岁 · {patient.gender === 'male' ? '男' : '女'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clinical Data Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">临床数据</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年龄 *
                </label>
                <input
                  type="number"
                  value={clinicalInputs.age}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="岁"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性别
                </label>
                <select
                  value={clinicalInputs.gender}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BMI
              </label>
              <input
                type="number"
                step="0.1"
                value={clinicalInputs.bmi}
                onChange={(e) => setClinicalInputs(prev => ({ ...prev, bmi: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="kg/m²"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  空腹血糖 *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={clinicalInputs.fasting_glucose}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, fasting_glucose: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="mmol/L"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  餐后血糖
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={clinicalInputs.postprandial_glucose}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, postprandial_glucose: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="mmol/L"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                糖化血红蛋白 (HbA1c) *
              </label>
              <input
                type="number"
                step="0.1"
                value={clinicalInputs.hba1c}
                onChange={(e) => setClinicalInputs(prev => ({ ...prev, hba1c: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="%"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  收缩压
                </label>
                <input
                  type="number"
                  value={clinicalInputs.systolic_bp}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, systolic_bp: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="mmHg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  舒张压
                </label>
                <input
                  type="number"
                  value={clinicalInputs.diastolic_bp}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, diastolic_bp: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="mmHg"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={clinicalInputs.family_history}
                  onChange={(e) => setClinicalInputs(prev => ({ ...prev, family_history: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">家族糖尿病史</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">症状</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {symptoms.map((symptom) => (
            <label
              key={symptom}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={clinicalInputs.symptoms.includes(symptom)}
                onChange={() => handleSymptomToggle(symptom)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate('/patients')}
          className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          取消
        </button>
        <button
          onClick={handleDiagnosis}
          disabled={loading || !selectedPatient}
          className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
              诊断中...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2 inline-block" />
              开始诊断
            </>
          )}
        </button>
      </div>

      {/* Recent Diagnoses */}
      {diagnosisReports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近诊断</h2>
            <button
              onClick={() => navigate('/diagnosis/history')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              查看全部
            </button>
          </div>
          
          <div className="space-y-3">
            {diagnosisReports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    report.risk_level === 'high' ? 'bg-red-500' :
                    report.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{report.patient_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getRiskLevelColor(report.risk_level)
                  }`}>
                    {getRiskLevelText(report.risk_level)}
                  </span>
                  <button
                    onClick={() => navigate(`/diagnosis/${report.id}`)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}