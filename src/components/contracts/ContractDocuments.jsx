import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Input from '../forms/Input';
import Select from '../forms/Select';
import Loading from '../ui/Loading';
import { 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  File, 
  X,
  AlertTriangle,
  Check,
  Calendar,
  User
} from 'lucide-react';

const ContractDocuments = ({ contract, documents: initialDocuments, onClose, onUpload, onDelete }) => {
  const [documents, setDocuments] = useState(initialDocuments || []);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    documentType: 'CONTRACT_PDF',
    description: ''
  });

  const [previewDocument, setPreviewDocument] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Update documents when initialDocuments changes
  useEffect(() => {
    setDocuments(initialDocuments || []);
  }, [initialDocuments]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setUploadError('حجم الملف يجب أن يكون أقل من 10MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('نوع الملف غير مدعوم. يجب أن يكون PDF أو صورة');
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !contract) return;

    const formDataObj = new FormData();
    formDataObj.append('contractDocument', selectedFile);
    formDataObj.append('documentType', formData.documentType);
    if (formData.description) {
      formDataObj.append('description', formData.description);
    }

    setUploading(true);
    setUploadError(null);

    try {
      const result = await onUpload(formDataObj);
      setDocuments(prev => [result, ...prev]);
      setSelectedFile(null);
      setFormData({ documentType: 'CONTRACT_PDF', description: '' });
    } catch (err) {
      setUploadError(err.message || 'فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

    setDeletingId(documentId);
    try {
      await onDelete(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      alert('فشل حذف المستند: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (document) => {
    if (document.filePath) {
      window.open(document.filePath, '_blank');
    }
  };

  const handleDownload = (document) => {
    if (document.filePath) {
      const link = document.createElement('a');
      link.href = document.filePath;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDocumentType = (type) => {
    const types = {
      'CONTRACT_PDF': 'عقد PDF',
      'CERTIFICATE': 'شهادة',
      'INSURANCE': 'تأمين',
      'PAYMENT_RECEIPT': 'إيصال دفع',
      'OTHER': 'أخرى'
    };
    return types[type] || type;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const documentStats = {
    total: documents.length,
    pdf: documents.filter(d => d.fileName?.endsWith('.pdf')).length,
    images: documents.filter(d => 
      d.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)
    ).length,
    totalSize: formatFileSize(
      documents.reduce((sum, doc) => sum + (doc.fileSizeMb || 0) * 1024 * 1024, 0)
    )
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="مستندات العقد" size="xl">
      <div className="space-y-6">
        {/* معلومات العقد */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">عقد #{contract.contractNumber}</h4>
              <p className="text-sm text-blue-600">
                {contract.client?.user?.fullName || 'غير محدد'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">
                {documentStats.total} مستندات
              </p>
              <p className="text-sm text-blue-600">
                الحجم الكلي: {documentStats.totalSize}
              </p>
            </div>
          </div>
        </div>

        {/* إحصائيات المستندات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{documentStats.total}</div>
            <div className="text-sm text-gray-600">إجمالي المستندات</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{documentStats.pdf}</div>
            <div className="text-sm text-gray-600">ملفات PDF</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{documentStats.images}</div>
            <div className="text-sm text-gray-600">صور</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{documentStats.totalSize}</div>
            <div className="text-sm text-gray-600">الحجم الكلي</div>
          </div>
        </div>

        {/* رفع مستند جديد */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">رفع مستند جديد</h3>
          
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{uploadError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المستند *
                </label>
                <Select
                  value={formData.documentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                  options={[
                    { value: 'CONTRACT_PDF', label: 'عقد PDF' },
                    { value: 'CERTIFICATE', label: 'شهادة' },
                    { value: 'INSURANCE', label: 'تأمين' },
                    { value: 'PAYMENT_RECEIPT', label: 'إيصال دفع' },
                    { value: 'OTHER', label: 'أخرى' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المستند (اختياري)
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر للمستند"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختيار الملف *
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-2">
                        <Upload className="mx-auto text-gray-400" size={32} />
                        <div>
                          <p className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : 'اسحب وأفلت الملف أو انقر للاختيار'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG (الحد الأقصى 10MB)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload size={16} className="mr-2" />
                          رفع
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="text-green-500" size={20} />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Check className="text-green-500" size={20} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* بحث المستندات */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="ابحث في المستندات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<FileText size={18} />}
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredDocuments.length} من {documents.length}
          </div>
        </div>

        {/* قائمة المستندات */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText className="mx-auto text-gray-300" size={48} />
            <p className="text-gray-500 mt-4">لا توجد مستندات</p>
            <p className="text-sm text-gray-400 mt-1">ابدأ برفع مستندات جديدة</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المستند
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحجم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تاريخ الرفع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رفع بواسطة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            document.fileName?.endsWith('.pdf') ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            {document.fileName?.endsWith('.pdf') ? (
                              <FileText className="text-red-600" size={20} />
                            ) : (
                              <File className="text-blue-600" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {document.fileName}
                            </p>
                            {document.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {document.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {formatDocumentType(document.documentType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatFileSize((document.fileSizeMb || 0) * 1024 * 1024)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          {document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString('ar-SA') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User size={14} />
                          {document.uploader?.fullName || 'غير معروف'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(document)}
                            title="عرض"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            title="تحميل"
                          >
                            <Download size={14} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(document.id)}
                            disabled={deletingId === document.id}
                            title="حذف"
                          >
                            {deletingId === document.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تحذيرات */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" size={18} />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">ملاحظات هامة</h4>
              <ul className="text-xs text-yellow-600 mt-1 space-y-1 list-disc pr-4">
                <li>يجب أن تكون جميع المستندات بصيغة PDF أو صورة</li>
                <li>الحد الأقصى لحجم الملف هو 10MB</li>
                <li>احتفظ بنسخة احتياطية من جميع المستندات المهمة</li>
                <li>المستندات المحذوفة لا يمكن استرجاعها</li>
              </ul>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ContractDocuments;