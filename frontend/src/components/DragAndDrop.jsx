import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const DragAndDrop = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' or 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = async (selectedFile) => {
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setUploadStatus('error');
            setErrorMessage('Please upload a valid PDF file.');
            return;
        }

        setFile(selectedFile);
        setIsUploading(true);
        setUploadStatus(null);
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log('Upload successful:', data);
            setIsUploading(false);
            setUploadStatus('success');
        } catch (error) {
            console.error('Error uploading file:', error);
            setIsUploading(false);
            setUploadStatus('error');
            setErrorMessage('Failed to connect to the server or upload file.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                accept=".pdf"
                style={{ display: 'none' }}
            />

            {isUploading ? (
                <>
                    <div className="loader"></div>
                    <p className="drop-text">Uploading document...</p>
                    <p className="drop-subtext">Please wait while we process {file?.name}</p>
                </>
            ) : uploadStatus === 'success' ? (
                <>
                    <CheckCircle className="drop-icon" style={{ color: '#10b981' }} />
                    <p className="drop-text">Upload Complete!</p>
                    <p className="drop-subtext">{file?.name} is ready for analysis.</p>
                </>
            ) : uploadStatus === 'error' ? (
                <>
                    <AlertCircle className="drop-icon" style={{ color: '#ef4444' }} />
                    <p className="drop-text">Upload Failed</p>
                    <p className="drop-subtext" style={{ color: '#ef4444' }}>{errorMessage}</p>
                    <p className="drop-subtext" style={{ marginTop: '0.5rem' }}>Click or drag to try again</p>
                </>
            ) : (
                <>
                    <UploadCloud className="drop-icon" />
                    <p className="drop-text">Drop your invoice here</p>
                    <p className="drop-subtext">or click to browse (.pdf only)</p>
                </>
            )}
        </div>
    );
};

export default DragAndDrop;
