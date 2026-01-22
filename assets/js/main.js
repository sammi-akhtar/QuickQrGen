// QuickQRGen - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Current QR data and configuration
    let currentQRData = {
        type: null,
        content: null,
        qrCode: null,
        qrStyling: null
    };

    // Initialize the application
    function init() {
        // Set up event listeners
        setupEventListeners();

        // Initialize QR styling options
        initQRStyling();

        // Show the first step
        showStep(1);
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Step navigation
        document.addEventListener('click', function(e) {
            if (e.target.closest('#next-to-design')) {
                e.preventDefault();
                navigateToStep(3);
            }
        });

        // Download button
        document.getElementById('download-qr')?.addEventListener('click', downloadQRCode);

        // Size slider
        const sizeSlider = document.getElementById('qr-size');
        const sizeValue = document.getElementById('size-value');

        if (sizeSlider && sizeValue) {
            sizeSlider.addEventListener('input', function() {
                sizeValue.textContent = this.value + 'px';
                if (currentQRData.qrStyling) {
                    updateQRPreview();
                }
            });
        }

        // Color pickers
        document.getElementById('qr-color')?.addEventListener('input', updateQRPreview);
        document.getElementById('bg-color')?.addEventListener('input', updateQRPreview);
        document.getElementById('error-correction')?.addEventListener('change', updateQRPreview);
    }

    // Initialize QR styling library
    function initQRStyling() {
        const qrPreview = document.getElementById('qr-preview');
        if (!qrPreview) return;

        currentQRData.qrStyling = new QRCodeStyling({
            width: 260,  // Fixed preview size
            height: 260, // Fixed preview size
            data: "QuickQRGen",
            margin: 10,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: 'M'
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 5
            },
            dotsOptions: {
                color: "#000000",
                type: "square"
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            image: "",
            cornersSquareOptions: {
                color: "#000000",
                type: "square"
            },
            cornersDotOptions: {
                color: "#000000",
                type: "square"
            },
            file: "svg"
        });

        // Append to preview container
        currentQRData.qrStyling.append(qrPreview);
    }

    // Show specific step and hide others
    function showStep(stepNumber) {
        // Hide all steps
        const steps = document.querySelectorAll('.qr-step');
        steps.forEach(step => {
            step.classList.add('hidden');
        });

        // Show selected step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.classList.remove('hidden');
        }

        // Update progress indicator
        updateProgressIndicator(stepNumber);
    }

    // Update progress indicator
    function updateProgressIndicator(currentStep) {
        const indicators = document.querySelectorAll('.flex.flex-col.items-center');

        indicators.forEach((indicator, index) => {
            const stepNumber = index + 1;
            const circle = indicator.querySelector('.rounded-full');
            const text = indicator.querySelector('span');

            if (circle && text) {
                if (stepNumber === currentStep) {
                    circle.classList.remove('bg-gray-300', 'text-gray-600');
                    circle.classList.add('bg-indigo-600', 'text-white');
                    text.classList.remove('text-gray-600');
                    text.classList.add('text-indigo-600');
                } else if (stepNumber < currentStep) {
                    circle.classList.remove('bg-gray-300', 'text-gray-600');
                    circle.classList.add('bg-green-600', 'text-white');
                    text.classList.remove('text-gray-600');
                    text.classList.add('text-green-600');
                } else {
                    circle.classList.remove('bg-indigo-600', 'text-white', 'bg-green-600');
                    circle.classList.add('bg-gray-300', 'text-gray-600');
                    text.classList.remove('text-indigo-600', 'text-green-600');
                    text.classList.add('text-gray-600');
                }
            }
        });
    }

    // Navigate to specific step
    function navigateToStep(stepNumber) {
        // Validate content before proceeding
        if (stepNumber === 3 && !validateContent()) {
            return;
        }

        showStep(stepNumber);

        // If going to step 3, generate QR code
        if (stepNumber === 3 && currentQRData.content) {
            generateQRCode(currentQRData.content);
        }
    }

    // Validate content before generating QR
    function validateContent() {
        // Check if we're on the main index page (step 1)
        if (document.getElementById('step1')) {
            alert('Please select a QR type and enter content first.');
            return false;
        }

        // Check if we're on individual QR type pages
        const qrForm = document.getElementById('qr-form');
        if (!qrForm) {
            alert('Please add content for your QR code.');
            return false;
        }

        // Get the first input or textarea in the form
        const contentInput = qrForm.querySelector('input:not([type="hidden"]), textarea');
        if (!contentInput) {
            alert('Please add content for your QR code.');
            return false;
        }

        const content = contentInput.value.trim();
        if (!content) {
            alert('Content cannot be empty.');
            return false;
        }

        // Additional validation for specific input types
        if (contentInput.type === 'email' && !content.includes('@')) {
            alert('Please enter a valid email address.');
            return false;
        }

        if (contentInput.type === 'url') {
            try {
                new URL(content);
            } catch (e) {
                alert('Please enter a valid URL including https://');
                return false;
            }
        }

        currentQRData.content = content;
        return true;
    }

    // Generate QR code (preview only - fixed size)
    function generateQRCode(content) {
        if (!currentQRData.qrStyling) {
            console.error('QR Styling not initialized');
            return;
        }

        // Update QR data for preview (always 260px)
        currentQRData.qrStyling.update({
            data: content,
            width: 260,  // Fixed preview size
            height: 260, // Fixed preview size
            dotsOptions: {
                color: document.getElementById('qr-color')?.value || '#000000'
            },
            backgroundOptions: {
                color: document.getElementById('bg-color')?.value || '#ffffff'
            },
            qrOptions: {
                errorCorrectionLevel: document.getElementById('error-correction')?.value || 'M'
            }
        });

        // Store the QR code data for download
        currentQRData.qrCode = content;
    }

    // Update QR preview when options change
    function updateQRPreview() {
        if (!currentQRData.qrStyling || !currentQRData.content) return;

        generateQRCode(currentQRData.content);
    }

    // Download QR code
    function downloadQRCode() {
        if (!currentQRData.qrStyling || !currentQRData.content) {
            alert('Please generate a QR code first.');
            return;
        }

        const format = document.getElementById('qr-format').value;
        const size = parseInt(document.getElementById('qr-size').value);
        const type = currentQRData.type || 'qr';
        const filename = `quickqrgen-${type}-${size}px.${format}`;

        // Create a new QR instance for download with correct size
        const downloadQR = new QRCodeStyling({
            width: size,
            height: size,
            data: currentQRData.content,
            margin: 10,
            qrOptions: {
                typeNumber: 0,
                mode: 'Byte',
                errorCorrectionLevel: document.getElementById('error-correction')?.value || 'M'
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: 0.4,
                margin: 5
            },
            dotsOptions: {
                color: document.getElementById('qr-color')?.value || '#000000',
                type: "square"
            },
            backgroundOptions: {
                color: document.getElementById('bg-color')?.value || '#ffffff'
            },
            cornersSquareOptions: {
                color: document.getElementById('qr-color')?.value || '#000000',
                type: "square"
            },
            cornersDotOptions: {
                color: document.getElementById('qr-color')?.value || '#000000',
                type: "square"
            },
            file: format
        });

        // Download the QR code with correct size
        downloadQR.download({
            name: filename,
            extension: format
        });
    }

    // Initialize the app
    init();

    // Expose some functions to global scope for debugging
    window.QuickQRGen = {
        generateQRCode,
        updateQRPreview,
        downloadQRCode
    };
});
