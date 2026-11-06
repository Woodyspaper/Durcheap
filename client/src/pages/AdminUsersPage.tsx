import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Download, Upload, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface ImportResult {
  imported: number;
  errors: string[];
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);

  // Get users count for display
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/users/export', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export users');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default with timestamp
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `Users_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return filename;
    },
    onSuccess: (filename) => {
      toast({
        title: "Export Successful",
        description: `Users exported to ${filename}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      const response = await apiRequest('POST', '/api/admin/users/import', { csvData });
      return await response.json();
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      setShowImportResult(true);
      setCsvFile(null);
      
      if (result.imported > 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        toast({
          title: "Import Completed",
          description: `${result.imported} users imported successfully`,
        });
      }
      
      if (result.errors.length > 0) {
        toast({
          title: "Import Warnings",
          description: `${result.errors.length} rows had errors`,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setShowImportResult(false);
      setImportResult(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!csvFile) return;

    try {
      const csvData = await csvFile.text();
      importMutation.mutate(csvData);
    } catch (error) {
      toast({
        title: "File Read Error",
        description: "Failed to read the CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Export and import user accounts via CSV files</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Users Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Users
              </CardTitle>
              <CardDescription>
                Download all user accounts as a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Total Users: {users.length || 'Loading...'}</span>
              </div>
              
              <Button 
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending}
                className="w-full"
              >
                {exportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Users CSV
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-500">
                File will be named: Users_YYYY-MM-DD.csv
              </p>
            </CardContent>
          </Card>

          {/* Import Users Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Users
              </CardTitle>
              <CardDescription>
                Upload a CSV file to create new user accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {csvFile && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium">Selected: {csvFile.name}</p>
                  <p className="text-xs text-gray-600">Size: {(csvFile.size / 1024).toFixed(1)} KB</p>
                </div>
              )}

              <Button 
                onClick={handleImport}
                disabled={!csvFile || importMutation.isPending}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Users
                  </>
                )}
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Required CSV columns: email, firstName, lastName. Optional: username, role, businessName, etc.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Import Results */}
        {showImportResult && importResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResult.imported > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                  <div className="text-sm text-green-700">Users Imported</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-md">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-700">Error Details:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-xs p-2 bg-red-50 border-l-2 border-red-200 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* CSV Format Help */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
            <CardDescription>
              Use this format for importing users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <div className="font-bold mb-2">Required columns:</div>
              <div>email,firstName,lastName</div>
              <br />
              <div className="font-bold mb-2">Optional columns:</div>
              <div>username,role,businessName,businessAddress,businessCity,businessState,businessZipCode,businessCountry,taxId,subscriptionPlan,subscriptionStatus,referredByCode</div>
              <br />
              <div className="font-bold mb-2">Example:</div>
              <div>email,firstName,lastName,role,businessName</div>
              <div>john@example.com,John,Doe,buyer,</div>
              <div>jane@example.com,Jane,Smith,seller,Jane's Shop</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}