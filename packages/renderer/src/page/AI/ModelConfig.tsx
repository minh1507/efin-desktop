import React, { useState, useEffect } from 'react';
import { useAI } from '../../services/ai/ai-context';
import { AIModelConfig } from '../../services/ai/openai-service';
import { useLanguage } from '../../components/language-provider';
import { 
  getSavedModelConfigs, 
  addOrUpdateModelConfig, 
  deleteModelConfig, 
  SavedModelConfig, 
  generateConfigId,
  isModelConfigUsable
} from '../../services/ai/model-config-service';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { 
  Server, 
  Plus, 
  Trash2, 
  Edit, 
  Check,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

interface ModelConfigProps {
  onModelSelect?: (config: SavedModelConfig) => void;
}

const ModelConfig: React.FC<ModelConfigProps> = ({ onModelSelect }) => {
  const { t } = useLanguage();
  const { 
    apiKey, setApiKey, 
    modelConfig, setModelConfig
  } = useAI();
  
  const [savedConfigs, setSavedConfigs] = useState<SavedModelConfig[]>([]);
  const [currentEditingConfig, setCurrentEditingConfig] = useState<SavedModelConfig | null>(null);
  const [activeModelConfig, setActiveModelConfig] = useState<SavedModelConfig | null>(null);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  // Load saved model configs
  useEffect(() => {
    const configs = getSavedModelConfigs();
    setSavedConfigs(configs);
    
    // Set active model if not already set
    if (!activeModelConfig) {
      const defaultConfig = configs.find(c => isModelConfigUsable(c)) || configs[0];
      setActiveModelConfig(defaultConfig);
      if (defaultConfig.apiKey) {
        setApiKey(defaultConfig.apiKey);
        setModelConfig({
          type: defaultConfig.type,
          apiKey: defaultConfig.apiKey,
          model: defaultConfig.model,
          endpoint: defaultConfig.endpoint
        });
      }
    }
  }, []);

  // Select a saved model config
  const selectSavedConfig = (config: SavedModelConfig) => {
    setApiKey(config.apiKey || '');
    setModelConfig({
      type: config.type,
      apiKey: config.apiKey,
      model: config.model,
      endpoint: config.endpoint
    });
    setActiveModelConfig(config);
    
    // Notify parent component if callback provided
    if (onModelSelect) {
      onModelSelect(config);
    }
  };

  // Create or update a model config
  const handleSaveModelConfig = () => {
    if (!currentEditingConfig) return;

    // Make sure we have required fields
    if (!currentEditingConfig.name || !currentEditingConfig.apiKey) {
      alert(t('ai.enter_required_fields'));
      return;
    }

    if (currentEditingConfig.type === 'custom' && !currentEditingConfig.endpoint) {
      alert(t('ai.enter_endpoint'));
      return;
    }

    addOrUpdateModelConfig(currentEditingConfig);
    setSavedConfigs(getSavedModelConfigs());
    setCurrentEditingConfig(null);
  };

  // Confirm delete model
  const confirmDeleteModel = (id: string) => {
    setModelToDelete(id);
    setShowDeleteDialog(true);
  };

  // Delete a model config
  const handleDeleteModelConfig = () => {
    if (modelToDelete) {
      deleteModelConfig(modelToDelete);
      setSavedConfigs(getSavedModelConfigs());
      setShowDeleteDialog(false);
      setModelToDelete(null);
    }
  };

  // Start editing a model config
  const startEditingModelConfig = (config: SavedModelConfig) => {
    setCurrentEditingConfig({...config});
  };

  // Create a new model config
  const createNewModelConfig = () => {
    setCurrentEditingConfig({
      id: generateConfigId(),
      name: '',
      type: 'custom',
      apiKey: apiKey || '',
      model: 'v_chat',
      endpoint: 'https://genai.vnpay.vn/aigateway/llm/v1/chat/completions'
    });
  };

  // Model config edit dialog
  const renderModelConfigEdit = () => (
    <Dialog open={!!currentEditingConfig} onOpenChange={(open) => !open && setCurrentEditingConfig(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentEditingConfig?.id ? t('ai.edit_model') : t('ai.add_model')}
          </DialogTitle>
        </DialogHeader>
        
        {currentEditingConfig && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">{t('ai.model_name')}</Label>
              <Input
                id="model-name"
                value={currentEditingConfig.name}
                onChange={(e) => setCurrentEditingConfig({...currentEditingConfig, name: e.target.value})}
                placeholder={t('ai.model_name')}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('ai.model_type')}</Label>
              <RadioGroup
                value={currentEditingConfig.type}
                onValueChange={(value: 'openai' | 'custom') => 
                  setCurrentEditingConfig({...currentEditingConfig, type: value})
                }
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                  <RadioGroupItem value="openai" id="edit-openai" />
                  <Label htmlFor="edit-openai" className="cursor-pointer flex-1">
                    {t('ai.openai_model')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                  <RadioGroupItem value="custom" id="edit-custom" />
                  <Label htmlFor="edit-custom" className="cursor-pointer flex-1">
                    {t('ai.custom_model')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {currentEditingConfig.type === 'custom' && (
              <div className="space-y-2 hidden">
                <Label htmlFor="edit-endpoint">{t('ai.custom_endpoint')}</Label>
                <Input
                  id="edit-endpoint"
                  value={currentEditingConfig.endpoint || 'https://genai.vnpay.vn/aigateway/llm/v1/chat/completions'}
                  onChange={(e) => setCurrentEditingConfig({...currentEditingConfig, endpoint: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="edit-api-key">{t('ai.api_key')}</Label>
              <Input
                id="edit-api-key"
                type="password"
                value={currentEditingConfig.apiKey || ''}
                onChange={(e) => setCurrentEditingConfig({...currentEditingConfig, apiKey: e.target.value})}
                placeholder={t('ai.api_key')}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrentEditingConfig(null)}>
                {t('app.cancel')}
              </Button>
              <Button onClick={handleSaveModelConfig}>
                {t('ai.save_model')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
  
  // Delete confirmation dialog
  const renderDeleteConfirmDialog = () => (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t('ai.delete_model')}
          </DialogTitle>
          <DialogDescription>
            {t('ai.confirm_delete_model')}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            {t('app.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDeleteModelConfig}>
            {t('ai.delete_model')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto p-4">
      {renderModelConfigEdit()}
      {renderDeleteConfirmDialog()}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Server className="h-6 w-6" />
          {t('ai.model_management')}
        </h1>
        <Button onClick={createNewModelConfig} className="gap-1">
          <Plus className="h-4 w-4" />
          {t('ai.add_model')}
        </Button>
      </div>
      
      {savedConfigs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <Server className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">{t('ai.no_saved_models')}</p>
          <Button onClick={createNewModelConfig} variant="outline" className="mt-4 gap-1">
            <Plus className="h-4 w-4" />
            {t('ai.add_model')}
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('ai.model_name')}</TableHead>
                  <TableHead>{t('ai.model_type')}</TableHead>
                  <TableHead>{t('ai.api_key')}</TableHead>
                  <TableHead className="w-[150px] text-right">{t('app.settings')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell className="font-medium">
                      {config.name}
                      {activeModelConfig?.id === config.id && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {t('ai.active_model')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{config.type === 'openai' ? 'OpenAI' : 'VNPAY v_chat'}</TableCell>
                    <TableCell>
                      {config.apiKey ? (
                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
                          {config.apiKey.substring(0, 6)}****
                        </span>
                      ) : (
                        <span className="text-xs text-red-500">
                          {t('ai.config_models_first')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        {isModelConfigUsable(config) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => selectSavedConfig(config)}
                            title={t('ai.select_model')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t('app.active')}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => startEditingModelConfig(config)}
                          title={t('ai.edit_model')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {config.id !== 'default-v-chat' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => confirmDeleteModel(config.id)}
                            title={t('ai.delete_model')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">{t('ai.api_key')}</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              {t('ai.enter_api_key')}
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="global-api-key">{t('ai.api_key')}</Label>
                <Input
                  id="global-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('ai.setup_api_key')}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('ai.api_key_stored_locally')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelConfig; 