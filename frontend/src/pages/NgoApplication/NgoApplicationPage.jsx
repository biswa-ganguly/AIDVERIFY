import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Upload, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';
import NgoNav from '../../components/NgoNav';
import { Link, useNavigate } from "react-router-dom"
import { useUser } from '@clerk/clerk-react';

// --- Reusable File Upload Component (FIXED) ---
const FileUpload = ({ id, label, required, onFileSelect, fileName }) => {
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        onFileSelect(id, file || null);
    };
    return (
        <div className="space-y-2 ">
            <Label htmlFor={id}>
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center space-x-2">
                <Input id={id} type="file" className="hidden" onChange={handleFileChange} />
                <Button asChild variant="outline">
                    <Label htmlFor={id} className="cursor-pointer flex items-center">
                        <Upload className="w-4 h-4 mr-2"/> Choose File
                    </Label>
                </Button>
                {fileName && (
                    // FIXED: Added text-muted-foreground for visibility
                    <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="w-4 h-4 mr-2 text-green-600" />
                        <span>{fileName}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

    export default function NgoApplicationPage() {
        const pageRef = useRef(null);
        const [activeTab, setActiveTab] = useState('step1');
        const [formData, setFormData] = useState({});
        const [files, setFiles] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [showSuccessDialog, setShowSuccessDialog] = useState(false);
        const navigate = useNavigate();
        const { user } = useUser();

        useEffect(() => {
            if (user?.emailAddresses?.[0]?.emailAddress) {
                setFormData(prev => ({ ...prev, email: user.emailAddresses[0].emailAddress }));
            }
        }, [user]);

        const handleInputChange = (e) => {
            const { id, value } = e.target;
            setFormData(prev => ({ ...prev, [id]: value }));
        };
        
        const handleFileSelect = (id, file) => {
            setFiles(prev => ({ ...prev, [id]: file }));
        };

        const handleCheckboxChange = (id, checked) => {
            setFormData(prev => ({ ...prev, [id]: !!checked }));
        };
        
        const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/ngo/apply`;
            const data = new FormData();

            // Append form data as JSON string
            data.append("formData", JSON.stringify(formData));

            // Append individual files with correct keys
            if (files.ngoCertificate) data.append("ngoCertificate", files.ngoCertificate);
            if (files.financialStatement) data.append("financialStatement", files.financialStatement);
            if (files.idProof) data.append("idProof", files.idProof);
            if (files.fieldImages) data.append("fieldImages", files.fieldImages);
            if (files.cancelledCheque) data.append("cancelledCheque", files.cancelledCheque);

            const response = await fetch(endpoint, {
                method: "POST",
                body: data
            });

            if (!response.ok) throw new Error("Failed to submit");

            setShowSuccessDialog(true);
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong! Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStep1Valid = useMemo(() => {
        return formData.ngoName && formData.registrationNumber && formData.contactPerson && formData.designation && formData.email && formData.phone;
    }, [formData]);
    const isStep2Valid = useMemo(() => {
        return formData.campaignTitle && formData.tagline && formData.category && formData.location && formData.startDate && formData.endDate && formData.description && formData.beneficiaries && formData.goalAmount;
    }, [formData]);
    const isStep3Valid = useMemo(() => {
        return files.ngoCertificate && files.financialStatement && files.idProof;
    }, [files]);
    const isStep4Valid = useMemo(() => {
        return formData.accountNumber && formData.ifscCode && formData.bankName && files.cancelledCheque;
    }, [formData, files]);
    const isStep5Valid = useMemo(() => {
        return formData.terms && formData.authenticity && formData.signature;
    }, [formData]);


    const nextStep = (step) => setActiveTab(step);
    const prevStep = (step) => setActiveTab(step);

    useLayoutEffect(() => {
        gsap.from(pageRef.current, {  y: 30, duration: 0.8, ease: 'power3.out' });
    }, []);

    const tabData = [
        { value: 'step1', name: 'NGO Information' },
        { value: 'step2', name: 'Campaign Details' },
        { value: 'step3', name: 'Verification' },
        { value: 'step4', name: 'Impact & Banking' },
        { value: 'step5', name: 'Submission' }
    ];

    return (
        <section>

            <NgoNav/>
        
        <div ref={pageRef} className=" min-h-screen">
            <div className="container max-w-screen-lg mx-auto py-12 px-4">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">List Your Campaign with AidVerifyAI</h1>
                    {/* FIXED: Added text-muted-foreground for proper styling */}
                    <p className="text-lg  mt-3 max-w-3xl mx-auto">
                        Join our platform to connect with donors who trust our AI-powered verification. Please fill out the form accurately to begin the review process.
                    </p>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                        {tabData.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value}>{tab.name}</TabsTrigger>
                        ))}
                    </TabsList>

                    {/* --- STEP 1: NGO INFORMATION --- */}
                    <TabsContent value="step1">
                        <Card className="mt-6">
                            <CardHeader><CardTitle>1. NGO Information</CardTitle><CardDescription>Tell us about your organization.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                {/* FIXED: Added `value` prop to all inputs for controlled components */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor="ngoName">NGO Name <span className="text-red-500">*</span></Label><Input id="ngoName" value={formData.ngoName || ''} placeholder="e.g., Hope Foundation" onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label htmlFor="registrationNumber">Registration Number <span className="text-red-500">*</span></Label><Input id="registrationNumber" value={formData.registrationNumber || ''} placeholder="e.g., S/1L/12345" onChange={handleInputChange} /></div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="website">Official Website / Social Media</Label><Input id="website" value={formData.website || ''} placeholder="https://example.com" onChange={handleInputChange} /></div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor="contactPerson">Contact Person Name <span className="text-red-500">*</span></Label><Input id="contactPerson" value={formData.contactPerson || ''} placeholder="Full Name" onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label htmlFor="designation">Designation <span className="text-red-500">*</span></Label><Input id="designation" value={formData.designation || ''} placeholder="e.g., Project Manager" onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label><Input id="email" type="email" value={formData.email || ''} placeholder="contact@ngo.org" disabled className="bg-muted" /></div>
                                    <div className="space-y-2"><Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label><Input id="phone" type="tel" value={formData.phone || ''} placeholder="+91 XXXXX XXXXX" onChange={handleInputChange} /></div>
                                </div>
                                <div className="flex justify-end pt-4"><Button onClick={() => nextStep('step2')} disabled={!isStep1Valid}>Next Step <ChevronRight className="w-4 h-4 ml-2"/></Button></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* --- STEP 2: CAMPAIGN DETAILS --- */}
                    <TabsContent value="step2">
                         <Card className="mt-6"><CardHeader><CardTitle>2. Campaign Details</CardTitle><CardDescription>Describe the campaign you want to launch.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2"><Label htmlFor="campaignTitle">Campaign Title <span className="text-red-500">*</span></Label><Input id="campaignTitle" value={formData.campaignTitle || ''} placeholder="e.g., Emergency Food Supply for Flood Victims" onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="tagline">Short Tagline <span className="text-red-500">*</span></Label><Input id="tagline" value={formData.tagline || ''} placeholder="Inspire donors in 1-2 lines" onChange={handleInputChange} /></div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                                        <Select value={formData.category || ''} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                            <SelectContent><SelectItem value="Disaster Relief">Disaster Relief</SelectItem><SelectItem value="Education">Education</SelectItem><SelectItem value="Health">Health</SelectItem><SelectItem value="Animals">Animals</SelectItem><SelectItem value="Environment">Environment</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label htmlFor="location">Target Location <span className="text-red-500">*</span></Label><Input id="location" value={formData.location || ''} placeholder="City, State, Country" onChange={handleInputChange} /></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label><Input id="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label><Input id="endDate" type="date" value={formData.endDate || ''} onChange={handleInputChange} /></div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="description">Detailed Description <span className="text-red-500">*</span></Label><Textarea id="description" value={formData.description || ''} placeholder="Tell the story of your campaign..." rows={5} onChange={handleInputChange} /></div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor="beneficiaries">Expected Beneficiaries <span className="text-red-500">*</span></Label><Input id="beneficiaries" value={formData.beneficiaries || ''} placeholder="e.g., 500 children" onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label htmlFor="goalAmount">Fundraising Goal (INR) <span className="text-red-500">*</span></Label><Input id="goalAmount" type="number" value={formData.goalAmount || ''} placeholder="e.g., 500000" onChange={handleInputChange} /></div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => prevStep('step1')}><ChevronLeft className="w-4 h-4 mr-2"/> Previous</Button>
                                    <Button onClick={() => nextStep('step3')} disabled={!isStep2Valid}>Next Step <ChevronRight className="w-4 h-4 ml-2"/></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* --- STEP 3: VERIFICATION & PROOF --- */}
                    <TabsContent value="step3">
                        <Card className="mt-6"><CardHeader><CardTitle>3. Verification & Proof</CardTitle><CardDescription>Upload necessary documents for our verification process.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <FileUpload id="ngoCertificate" label="NGO Registration Certificate" required onFileSelect={handleFileSelect} fileName={files.ngoCertificate?.name}/>
                                <FileUpload id="financialStatement" label="Financial Transparency Document (Last Audited Statement)" required onFileSelect={handleFileSelect} fileName={files.financialStatement?.name}/>
                                <FileUpload id="idProof" label="Identity Proof of Authorized Person (Aadhaar/PAN)" required onFileSelect={handleFileSelect} fileName={files.idProof?.name}/>
                                <FileUpload id="fieldImages" label="Field Images (Photos of location or related work)" onFileSelect={handleFileSelect} fileName={files.fieldImages?.name}/>
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => prevStep('step2')}><ChevronLeft className="w-4 h-4 mr-2"/> Previous</Button>
                                    <Button onClick={() => nextStep('step4')} disabled={!isStep3Valid}>Next Step <ChevronRight className="w-4 h-4 ml-2"/></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    {/* --- STEP 4: IMPACT & BANKING --- */}
                    <TabsContent value="step4">
                        <Card className="mt-6"><CardHeader><CardTitle>4. Impact & Banking</CardTitle><CardDescription>Showcase impact and provide banking details.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2"><Label htmlFor="story">Beneficiary Story / Case Study</Label><Textarea id="story" value={formData.story || ''} placeholder="Share a personal story..." rows={4} onChange={handleInputChange} /></div>
                                <div className="space-y-2"><Label htmlFor="outcomes">Expected Outcomes</Label><Textarea id="outcomes" value={formData.outcomes || ''} placeholder="e.g., Short-term: 500 families fed..." rows={3} onChange={handleInputChange} /></div>
                                <Separator className="my-6"/>
                                <h3 className="font-semibold text-lg">Banking Details</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label><Input id="accountNumber" value={formData.accountNumber || ''} onChange={handleInputChange} /></div>
                                    <div className="space-y-2"><Label htmlFor="ifscCode">IFSC Code <span className="text-red-500">*</span></Label><Input id="ifscCode" value={formData.ifscCode || ''} onChange={handleInputChange} /></div>
                                    <div className="space-y-2 md:col-span-2"><Label htmlFor="bankName">Bank Name & Branch <span className="text-red-500">*</span></Label><Input id="bankName" value={formData.bankName || ''} onChange={handleInputChange} /></div>
                                </div>
                                <FileUpload id="cancelledCheque" label="Cancelled Cheque / Passbook Copy" required onFileSelect={handleFileSelect} fileName={files.cancelledCheque?.name}/>
                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={() => prevStep('step3')}><ChevronLeft className="w-4 h-4 mr-2"/> Previous</Button>
                                    <Button onClick={() => nextStep('step5')} disabled={!isStep4Valid}>Next Step <ChevronRight className="w-4 h-4 ml-2"/></Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- STEP 5: LEGAL & SUBMISSION --- */}
                    <TabsContent value="step5">
                        <form onSubmit={handleSubmit}>
                            <Card className="mt-6"><CardHeader><CardTitle>5. Legal & Submission</CardTitle><CardDescription>Please review and agree to our terms before submitting.</CardDescription></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start space-x-3 rounded-md border p-4">
                                        <Checkbox id="terms" checked={formData.terms} onCheckedChange={(checked) => handleCheckboxChange('terms', checked)}/>
                                        <Label htmlFor="terms" className="text-sm font-medium leading-none">I agree to the <Link to="/campaign-rules" className="text-primary hover:underline">Terms & Conditions</Link> of AidVerifyAI. <span className="text-red-500">*</span></Label>
                                    </div>
                                    <div className="flex items-start space-x-3 rounded-md border p-4">
                                        <Checkbox id="authenticity" checked={formData.authenticity} onCheckedChange={(checked) => handleCheckboxChange('authenticity', checked)}/>
                                        <Label htmlFor="authenticity" className="text-sm font-medium leading-none">I declare that all the information and documents provided are authentic and accurate. <span className="text-red-500">*</span></Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signature">Digital Signature <span className="text-red-500">*</span></Label>
                                        <Input id="signature" value={formData.signature || ''} placeholder="Type your full name" onChange={handleInputChange} />
                                        <p className="text-xs text-muted-foreground">Typing your full name serves as your digital signature.</p>
                                    </div>
                                    <div className="flex justify-between pt-4">
                                        <Button variant="outline" onClick={() => prevStep('step4')}><ChevronLeft className="w-4 h-4 mr-2"/> Previous</Button>
                                        <Button size="lg" type="submit" disabled={!isStep5Valid || isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
        
        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Application Submitted Successfully!</DialogTitle>
                    <DialogDescription>
                        Your campaign application has been submitted and is now under review. 
                        You will be notified once the application review process will be done.
                        Please keep an eye on your email for updates.
                        Thank you for choosing AidVerifyAI to amplify your impact!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => navigate('/')}>
                        Okay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </section>
    );
}