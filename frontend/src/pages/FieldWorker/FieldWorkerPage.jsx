import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, CheckCircle, XCircle, Loader2, LogOut, History, UserCheck, Gift, AlertTriangle, Flag } from 'lucide-react';

const API_BASE = 'https://fa5db539ec4d.ngrok-free.app';

const FieldWorkerHeader = () => (
    <header className="flex items-center justify-between pb-4 border-b">
        <div>
            <h1 className="text-2xl font-bold">Field Worker Panel</h1>
            <p className="text-sm text-muted-foreground">AidVerifyAI - Real-Time Distribution</p>
        </div>
        <div className="text-right">
            <p className="font-semibold">Amit Singh</p>
            <p className="text-xs text-muted-foreground">Hope Foundation</p>
        </div>
    </header>
);

// --- UI Components for Different States ---

const CameraView = ({ videoRef, canvasRef, onStartCamera, onTakePicture, onStopCamera, cameraActive, isProcessing }) => (
    <Card className="text-center">
        <CardHeader>
            <CardTitle>Face Recognition Camera</CardTitle>
            <CardDescription>Open camera and take a picture for verification</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full h-64 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
                />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraActive && <Camera className="w-16 h-16 text-slate-500" />}
            </div>
            <div className="flex gap-2 w-full">
                <Button 
                    onClick={onStartCamera} 
                    disabled={cameraActive || isProcessing}
                    className="flex-1"
                >
                    Open Camera
                </Button>
                <Button 
                    onClick={onTakePicture} 
                    disabled={!cameraActive || isProcessing}
                    className="flex-1"
                >
                    {isProcessing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                        <>Take Picture</>
                    )}
                </Button>
                <Button 
                    onClick={onStopCamera} 
                    disabled={!cameraActive || isProcessing}
                    variant="outline"
                    className="flex-1"
                >
                    Stop Camera
                </Button>
            </div>
        </CardContent>
    </Card>
);

const VerifiedView = ({ username, confidence, onNext }) => (
    <Card className="border-green-500 bg-green-50/50">
        <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-2">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Verification Successful</CardTitle>
            <CardDescription className="text-green-700">
                Welcome {username}! Confidence: {confidence}%
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button size="lg" className="w-full" onClick={onNext}>
                <UserCheck className="mr-2 h-4 w-4" /> Next Person
            </Button>
        </CardContent>
    </Card>
);

const ExistingUserView = ({ username, onReportFraud, onScanNext }) => (
    <Card className="border-blue-500 bg-blue-50/50">
        <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-2">
                <UserCheck className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-blue-800">User Already Exists</CardTitle>
            <CardDescription className="text-blue-700">
                {username} is already in the system
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Button onClick={onReportFraud} variant="destructive" className="flex-1">
                    <Flag className="mr-2 h-4 w-4" /> Report Fraud
                </Button>
                <Button onClick={onScanNext} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" /> Scan Next
                </Button>
            </div>
        </CardContent>
    </Card>
);

const DistributionView = ({ username, onDistribute, onMarkFraud }) => (
    <Card className="border-green-500 bg-green-50/50">
        <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-2">
                <Gift className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-green-800">New Beneficiary</CardTitle>
            <CardDescription className="text-green-700">
                Ready to distribute aid to {username}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Button onClick={onDistribute} className="flex-1">
                    <Gift className="mr-2 h-4 w-4" /> Distribute Aid
                </Button>
                <Button onClick={onMarkFraud} variant="destructive" className="flex-1">
                    <Flag className="mr-2 h-4 w-4" /> Mark as Fraud
                </Button>
            </div>
        </CardContent>
    </Card>
);

// Popup Components
const NoFacePopup = ({ open, onClose }) => (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    No Face Detected
                </DialogTitle>
            </DialogHeader>
            <p>Please ensure your face is clearly visible and try again.</p>
            <Button onClick={onClose}>Retry</Button>
        </DialogContent>
    </Dialog>
);




export default function FieldWorkerPage() {
    const [status, setStatus] = useState('idle'); // idle, existingUser, distribution
    const [cameraActive, setCameraActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [eventName] = useState('B');
    const [verificationResult, setVerificationResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [userCount, setUserCount] = useState(0);
    
    // Popup states
    const [showNoFacePopup, setShowNoFacePopup] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [capturedImageBlob, setCapturedImageBlob] = useState(null);
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Fetch user count on component mount
    const fetchUserCount = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/all_user?event_name=${eventName}`);
            const result = await response.json();
            setUserCount(result.users ? result.users.length : 0);
        } catch (error) {
            console.error('Error fetching user count:', error);
            setUserCount(0);
        }
    };

    useEffect(() => {
        fetchUserCount();
    }, [eventName]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setCameraActive(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            streamRef.current = null;
        }
        setCameraActive(false);
    };

    const takePicture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
            setCapturedImageBlob(blob);
            await verifyFace(blob);
            setIsProcessing(false);
        }, 'image/jpeg', 0.8);
    };

    const verifyFace = async (imageBlob) => {
        try {
            const formData = new FormData();
            formData.append('event_name', eventName);
            formData.append('file', imageBlob, 'capture.jpg');

            const response = await fetch(`${API_BASE}/verify/`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            setVerificationResult(result);
            
            if (!result.face_detected) {
                setShowNoFacePopup(true);
            } else if (result.user_in_system) {
                setStatus('existingUser');
            } else {
                // Auto-add new user and go to distribution
                const generatedUsername = `U${userCount + 1}`;
                setNewUsername(generatedUsername);
                await autoAddNewUser(generatedUsername, imageBlob);
            }
        } catch (error) {
            console.error('Error verifying face:', error);
        }
    };

    const autoAddNewUser = async (username, imageBlob) => {
        try {
            const formData = new FormData();
            formData.append('event_name', eventName);
            formData.append('username', username);
            formData.append('file', imageBlob, 'capture.jpg');

            const response = await fetch(`${API_BASE}/addUser/`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                setUserCount(prev => prev + 1);
                setStatus('distribution');
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const addToHistory = (username, type = 'distributed') => {
        const newEntry = { 
            id: Date.now(), 
            username, 
            time: new Date().toLocaleTimeString(),
            type // 'distributed', 'fraud'
        };
        setHistory(prev => [newEntry, ...prev.slice(0, 4)]);
    };

    const handleNext = () => {
        setStatus('idle');
        setVerificationResult(null);
        setCapturedImageBlob(null);
        setNewUsername('');
        // Auto-open camera for next scan
        setTimeout(() => {
            startCamera();
        }, 500);
    };

    const handleReportFraud = () => {
        addToHistory(verificationResult?.username || 'Unknown', 'fraud');
        handleNext();
    };

    const handleDistribute = () => {
        addToHistory(newUsername, 'distributed');
        handleNext();
    };

    const handleMarkFraud = () => {
        addToHistory(newUsername, 'fraud');
        handleNext();
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const renderMainContent = () => {
        switch (status) {
            case 'existingUser':
                return (
                    <ExistingUserView 
                        username={verificationResult?.username}
                        onReportFraud={handleReportFraud}
                        onScanNext={handleNext}
                    />
                );
            case 'distribution':
                return (
                    <DistributionView 
                        username={newUsername}
                        onDistribute={handleDistribute}
                        onMarkFraud={handleMarkFraud}
                    />
                );
            default:
                return (
                    <CameraView 
                        videoRef={videoRef}
                        canvasRef={canvasRef}
                        onStartCamera={startCamera}
                        onTakePicture={takePicture}
                        onStopCamera={stopCamera}
                        cameraActive={cameraActive}
                        isProcessing={isProcessing}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <FieldWorkerHeader />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {renderMainContent()}
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-2">
                                <History className="w-5 h-5 text-muted-foreground"/>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {history.length > 0 ? (
                                    <ul className="space-y-3 text-sm">
                                        {history.map(item => (
                                            <li key={item.id} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.username}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        item.type === 'fraud' 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {item.type === 'fraud' ? 'FRAUD' : 'DISTRIBUTED'}
                                                    </span>
                                                </div>
                                                <span className="text-muted-foreground">{item.time}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No verifications recorded yet today.</p>
                                )}
                            </CardContent>
                        </Card>
                        <Button variant="outline" className="w-full"><LogOut className="mr-2 h-4 w-4"/>Logout</Button>
                    </div>
                </div>
            </div>
            
            {/* Popups */}
            <NoFacePopup 
                open={showNoFacePopup} 
                onClose={() => setShowNoFacePopup(false)} 
            />

        </div>
    );
}