
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'Shoply Store',
    storeEmail: 'contact@shoply.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Commerce St, Shopping City, SC 12345',
    logoUrl: '',
    faviconUrl: '',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@shoply.com',
    smtpPassword: '********',
    senderName: 'Shoply Store',
    senderEmail: 'notifications@shoply.com',
  });

  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'USD',
    currencySymbol: '$',
    taxRate: '7.5',
    enablePaypal: true,
    enableStripe: true,
    enableCOD: true,
    stripePublicKey: 'pk_test_******',
    stripeSecretKey: '********',
    paypalClientId: '********',
  });

  const { toast } = useToast();

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your general settings have been updated successfully.",
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your email settings have been updated successfully.",
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your payment settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Store Settings</h2>
        <p className="text-muted-foreground">Manage your store configuration and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your store's basic information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input 
                      id="storeName" 
                      value={generalSettings.storeName} 
                      onChange={e => setGeneralSettings({...generalSettings, storeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Store Email</Label>
                    <Input 
                      id="storeEmail" 
                      type="email" 
                      value={generalSettings.storeEmail} 
                      onChange={e => setGeneralSettings({...generalSettings, storeEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Store Phone</Label>
                    <Input 
                      id="storePhone" 
                      value={generalSettings.storePhone} 
                      onChange={e => setGeneralSettings({...generalSettings, storePhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={generalSettings.logoUrl} 
                      placeholder="https://example.com/logo.png"
                      onChange={e => setGeneralSettings({...generalSettings, logoUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="storeAddress">Store Address</Label>
                    <Textarea 
                      id="storeAddress" 
                      value={generalSettings.storeAddress} 
                      onChange={e => setGeneralSettings({...generalSettings, storeAddress: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">Save General Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure your store's email notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input 
                      id="smtpServer" 
                      value={emailSettings.smtpServer} 
                      onChange={e => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort" 
                      value={emailSettings.smtpPort} 
                      onChange={e => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input 
                      id="smtpUsername" 
                      value={emailSettings.smtpUsername} 
                      onChange={e => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input 
                      id="smtpPassword" 
                      type="password"
                      value={emailSettings.smtpPassword} 
                      onChange={e => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Sender Name</Label>
                    <Input 
                      id="senderName" 
                      value={emailSettings.senderName} 
                      onChange={e => setEmailSettings({...emailSettings, senderName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senderEmail">Sender Email</Label>
                    <Input 
                      id="senderEmail" 
                      type="email"
                      value={emailSettings.senderEmail} 
                      onChange={e => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto">Save Email Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure your store's payment methods and options.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input 
                      id="currency" 
                      value={paymentSettings.currency} 
                      onChange={e => setPaymentSettings({...paymentSettings, currency: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currencySymbol">Currency Symbol</Label>
                    <Input 
                      id="currencySymbol" 
                      value={paymentSettings.currencySymbol} 
                      onChange={e => setPaymentSettings({...paymentSettings, currencySymbol: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input 
                      id="taxRate" 
                      type="number"
                      value={paymentSettings.taxRate} 
                      onChange={e => setPaymentSettings({...paymentSettings, taxRate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                    <Input 
                      id="stripePublicKey" 
                      value={paymentSettings.stripePublicKey} 
                      onChange={e => setPaymentSettings({...paymentSettings, stripePublicKey: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                    <Input 
                      id="stripeSecretKey" 
                      type="password"
                      value={paymentSettings.stripeSecretKey} 
                      onChange={e => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                    <Input 
                      id="paypalClientId" 
                      type="password"
                      value={paymentSettings.paypalClientId} 
                      onChange={e => setPaymentSettings({...paymentSettings, paypalClientId: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableStripe" 
                      checked={paymentSettings.enableStripe}
                      onCheckedChange={(checked) => 
                        setPaymentSettings({...paymentSettings, enableStripe: checked})
                      }
                    />
                    <Label htmlFor="enableStripe">Enable Stripe Payments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enablePaypal" 
                      checked={paymentSettings.enablePaypal}
                      onCheckedChange={(checked) => 
                        setPaymentSettings({...paymentSettings, enablePaypal: checked})
                      }
                    />
                    <Label htmlFor="enablePaypal">Enable PayPal Payments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableCOD" 
                      checked={paymentSettings.enableCOD}
                      onCheckedChange={(checked) => 
                        setPaymentSettings({...paymentSettings, enableCOD: checked})
                      }
                    />
                    <Label htmlFor="enableCOD">Enable Cash on Delivery</Label>
                  </div>
                </div>
                
                <Button type="submit" className="w-full md:w-auto">Save Payment Settings</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
