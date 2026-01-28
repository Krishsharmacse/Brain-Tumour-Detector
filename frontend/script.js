  // Configuration
    // Configuration
    const API_BASE_URL = "http://127.0.0.1:5001";
    // <--- CHANGE THIS to match the backend
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    // Initialize variables
    let map = null;
    let userMarker = null;
    let hospitalMarkers = [];
    let currentLocation = { lat: 28.6139, lng: 77.2090 }; // Default: New Delhi
    let currentHospitals = [];

    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const defaultResult = document.getElementById('defaultResult');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const locateBtn = document.getElementById('locateBtn');
    const resetMapBtn = document.getElementById('resetMapBtn');
    const mapStatus = document.getElementById('mapStatus');
    const hospitalList = document.getElementById('hospitalList');

    // Tumor information database
    const tumorInfo = {
      glioma: {
        description: "Gliomas are tumors that originate from glial cells in the brain or spinal cord. They can vary in aggressiveness from low-grade (slow-growing) to high-grade (fast-growing and invasive).",
        prescription: "Treatment typically involves surgical resection when possible, followed by radiation therapy and/or chemotherapy. For high-grade gliomas, temozolomide is commonly used. Clinical trials for immunotherapy and targeted therapies may be options.",
        prevention: "While most gliomas have no known prevention, reducing exposure to ionizing radiation and maintaining a healthy lifestyle with antioxidant-rich foods may help support brain health.",
        precaution: "Regular neurological check-ups, monitoring for new or worsening symptoms (headaches, seizures, cognitive changes), and immediate medical attention for any sudden neurological changes.",
        urgency: "high"
      },
      meningioma: {
        description: "Meningiomas are typically benign tumors that arise from the meninges, the protective membranes surrounding the brain and spinal cord. Most grow slowly and may not cause symptoms for years.",
        prescription: "Treatment depends on size, location, and symptoms. Options include observation with regular MRI scans, surgical removal (craniotomy), or radiation therapy (stereotactic radiosurgery) for tumors in difficult-to-reach locations.",
        prevention: "There are no known preventive measures. Regular check-ups are important for people with risk factors like previous radiation therapy or certain genetic conditions.",
        precaution: "Monitor for symptoms like headaches, vision changes, hearing loss, or memory problems. Regular imaging follow-up for diagnosed meningiomas.",
        urgency: "medium"
      },
      notumor: {
        description: "No evidence of brain tumor detected. The brain anatomy appears normal within the limits of this imaging study. This is a reassuring finding.",
        prescription: "No specific treatment needed for brain tumor. Continue regular health maintenance and consult a physician for any new neurological symptoms.",
        prevention: "Maintain brain health through regular exercise, a balanced diet rich in omega-3 fatty acids and antioxidants, adequate sleep, stress management, and avoiding head injuries.",
        precaution: "Remain vigilant for any new neurological symptoms (persistent headaches, vision changes, weakness, seizures). Regular health check-ups are recommended.",
        urgency: "low"
      },
      pituitary: {
        description: "Pituitary tumors develop in the pituitary gland, a small gland at the base of the brain that controls hormone production. They can be functioning (produce hormones) or non-functioning.",
        prescription: "Treatment may include medication to control hormone production, transsphenoidal surgery (through the nose), radiation therapy, or a combination. Hormone replacement therapy may be needed after treatment.",
        prevention: "No known prevention. Early detection through evaluation of hormone-related symptoms is key to preventing complications.",
        precaution: "Regular monitoring of hormone levels, vision testing (as tumors can press on optic nerves), and immediate attention to symptoms like severe headaches or vision loss.",
        urgency: "medium"
      }
    };

    // Initialize Map
    function initMap() {
      if (map) return;

      map = L.map('map').setView([currentLocation.lat, currentLocation.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);
    }

    // Toast Notification System
    function showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
      };

      toast.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
      `;

      document.body.appendChild(toast);

      // Remove toast after animation
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 3000);
    }

    // File Upload Functions
    uploadArea.addEventListener('click', () => {
      imageInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#1abc9c';
      uploadArea.style.transform = 'translateY(-5px)';
      uploadArea.style.boxShadow = '0 10px 25px rgba(26, 188, 156, 0.3)';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'rgba(26, 188, 156, 0.4)';
      uploadArea.style.transform = 'translateY(0)';
      uploadArea.style.boxShadow = 'none';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'rgba(26, 188, 156, 0.4)';
      uploadArea.style.transform = 'translateY(0)';
      uploadArea.style.boxShadow = 'none';

      if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
          imageInput.files = e.dataTransfer.files;
          showPreview();
        }
      }
    });

    imageInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        if (validateFile(file)) {
          showPreview();
        }
      }
    });

    function validateFile(file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 10MB.`, 'error');
        return false;
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.dcm'];
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
        showToast('Invalid file type. Please upload JPEG, PNG, BMP, TIFF, or DICOM files.', 'error');
        return false;
      }

      return true;
    }

    function showPreview() {
      if (imageInput.files && imageInput.files[0]) {
        const file = imageInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
          uploadArea.innerHTML = `
            <div style="text-align: center;">
              <i class="fas fa-file-medical" style="font-size: 3rem; color: #1abc9c; margin-bottom: 15px;"></i>
              <div style="color: white; font-size: 1.1rem; margin-bottom: 10px; word-break: break-word;">${file.name}</div>
              <div style="color: #8cc8ff; font-size: 0.9rem;">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <img src="${e.target.result}" style="max-width: 200px; max-height: 150px; margin-top: 20px; border-radius: 10px; border: 2px solid rgba(26, 188, 156, 0.5);" />
            </div>
          `;
        };

        reader.readAsDataURL(file);
      }
    }

    // Map Functions
    locateBtn.addEventListener('click', async () => {
      if (!navigator.geolocation) {
        showToast("Geolocation is not supported by this browser.", "error");
        return;
      }

      locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
      locateBtn.disabled = true;
      mapStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting your location...';

      navigator.geolocation.getCurrentPosition(
        successLocation,
        errorLocation,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

    function successLocation(position) {
      currentLocation.lat = position.coords.latitude;
      currentLocation.lng = position.coords.longitude;

      locateBtn.innerHTML = '<i class="fas fa-check"></i> Location Found';
      locateBtn.disabled = false;

      updateMap();
      fetchNearbyHospitals();

      mapStatus.innerHTML = `<i class="fas fa-map-marker-alt"></i> Found ${currentHospitals.length} hospitals within 10km of your location`;
    }

    function errorLocation(error) {
      locateBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Find Nearby Hospitals';
      locateBtn.disabled = false;

      switch (error.code) {
        case error.PERMISSION_DENIED:
          showToast("Location permission denied. Using default location.", "warning");
          break;
        case error.POSITION_UNAVAILABLE:
          showToast("Location information unavailable.", "error");
          break;
        case error.TIMEOUT:
          showToast("Location request timed out.", "error");
          break;
        default:
          showToast("An unknown error occurred.", "error");
      }

      // Use default location
      updateMap();
      fetchNearbyHospitals();

      mapStatus.innerHTML = `<i class="fas fa-map-marker-alt"></i> Showing hospitals near default location (${currentHospitals.length} found)`;
    }

    function updateMap() {
      if (!map) initMap();

      map.setView([currentLocation.lat, currentLocation.lng], 13);

      // Clear existing markers
      if (userMarker) {
        map.removeLayer(userMarker);
      }

      // Add user marker
      userMarker = L.marker([currentLocation.lat, currentLocation.lng]).addTo(map)
        .bindPopup(`
          <div style="font-weight: bold; color: #3498db;">
            <i class="fas fa-user"></i> Your Location
          </div>
          <div style="font-size: 12px; color: #666;">
            ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}
          </div>
        `)
        .openPopup();
    }

    async function fetchNearbyHospitals() {
      try {
        // Clear existing hospital markers
        hospitalMarkers.forEach(marker => map.removeLayer(marker));
        hospitalMarkers = [];
        currentHospitals = [];

        // Using Overpass API to find hospitals within 10km
        const radius = 10000; // 10km in meters
        const query = `
  [out:json][timeout:25];
  (
    node["amenity"="hospital"](around:${radius},${currentLocation.lat},${currentLocation.lng});
    way["amenity"="hospital"](around:${radius},${currentLocation.lat},${currentLocation.lng});
    relation["amenity"="hospital"](around:${radius},${currentLocation.lat},${currentLocation.lng});
  );
  out center;
`;


        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.elements && data.elements.length > 0) {
          data.elements.forEach(element => {
            let lat, lng;

            if (element.center) {
              lat = element.center.lat;
              lng = element.center.lon;
            } else if (element.lat && element.lon) {
              lat = element.lat;
              lng = element.lon;
            } else {
              return; // Skip if no coordinates
            }

            const hospital = {
              name: element.tags.name || "Medical Center",
              phone: element.tags.phone || "Not available",
              address: element.tags["addr:full"] || element.tags["addr:street"] || "Address not specified",
              type: element.tags.healthcare || "General Hospital",
              lat: lat,
              lng: lng,
              distance: calculateDistance(currentLocation.lat, currentLocation.lng, lat, lng)
            };

            currentHospitals.push(hospital);

            // Add marker to map
            const marker = L.marker([lat, lng]).addTo(map)
              .bindPopup(`
                <div style="color: #333;">
                  <strong style="color: #e74c3c;">🏥 ${hospital.name}</strong><br>
                  <hr style="margin: 5px 0; border-color: #eee;">
                  <div style="font-size: 12px;">
                    <strong>Type:</strong> ${hospital.type}<br>
                    <strong>Phone:</strong> ${hospital.phone}<br>
                    <strong>Distance:</strong> ${hospital.distance.toFixed(1)} km<br>
                    <strong>Address:</strong> ${hospital.address}
                  </div>
                </div>
              `);

            hospitalMarkers.push(marker);
          });

          // Sort by distance
          currentHospitals.sort((a, b) => a.distance - b.distance);

          // Update hospital list
          updateHospitalList();

          showToast(`Found ${currentHospitals.length} medical centers nearby`, "success");
        } else {
          showToast("No hospitals found in the vicinity", "info");
          hospitalList.classList.add('hidden');
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        showToast("Error fetching hospital data. Please try again.", "error");
      }
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    function updateHospitalList() {
      if (currentHospitals.length === 0) {
        hospitalList.classList.add('hidden');
        return;
      }

      hospitalList.classList.remove('hidden');
      hospitalList.innerHTML = '';

      currentHospitals.forEach((hospital, index) => {
        const hospitalItem = document.createElement('div');
        hospitalItem.className = 'hospital-item';
        hospitalItem.innerHTML = `
          <div class="hospital-name">
            <i class="fas fa-hospital" style="color: #e74c3c;"></i>
            ${hospital.name}
          </div>
          <div class="hospital-details">
            <span><i class="fas fa-phone"></i> ${hospital.phone}</span>
            <span><i class="fas fa-location-arrow"></i> ${hospital.distance.toFixed(1)} km</span>
            <span><i class="fas fa-stethoscope"></i> ${hospital.type}</span>
          </div>
          <div style="font-size: 12px; color: #8cc8ff; margin-top: 5px;">
            <i class="fas fa-map-marker-alt"></i> ${hospital.address}
          </div>
        `;

        hospitalItem.addEventListener('click', () => {
          map.setView([hospital.lat, hospital.lng], 15);
          hospitalMarkers[index].openPopup();
        });

        hospitalList.appendChild(hospitalItem);
      });
    }

    resetMapBtn.addEventListener('click', () => {
      if (map) {
        map.setView([currentLocation.lat, currentLocation.lng], 13);
        userMarker.openPopup();
        showToast("Map reset to your location", "info");
      }
    });

    // Tumor Analysis Functions
    analyzeBtn.addEventListener('click', async () => {
      if (!imageInput.files[0]) {
        showToast('Please select an MRI image first.', 'warning');
        return;
      }

      const file = imageInput.files[0];

      if (!validateFile(file)) {
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      // Show loading, hide default result
      loadingDiv.classList.remove('hidden');
      defaultResult.style.display = 'none';
      resultDiv.innerHTML = '';
      resultDiv.classList.add('hidden');

      // Disable analyze button during processing
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

      try {
        // Make API call to Flask backend
        const response = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        // Re-enable analyze button
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-bolt"></i> Analyze Scan';

        loadingDiv.classList.add('hidden');

        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`);
        }

        if (data.prediction) {
          showToast('Analysis complete!', 'success');
          displayResult(data);

          // Auto-scroll to map and find hospitals if tumor is detected
          if (data.prediction !== 'notumor') {
            setTimeout(() => {
              document.getElementById('map-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });

              // Trigger hospital search if location is available
              if (currentLocation) {
                setTimeout(() => {
                  locateBtn.click();
                  showToast(`Tumor detected (${data.prediction}). Finding nearby hospitals...`, 'warning');
                }, 500);
              }
            }, 1000);
          }
        } else {
          throw new Error('No prediction in response');
        }

      } catch (error) {
        // Re-enable analyze button on error
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-bolt"></i> Analyze Scan';

        loadingDiv.classList.add('hidden');

        console.error('Prediction error:', error);

        // Show error to user
        resultDiv.innerHTML = `
          <div class="fade-in">
            <div style="background: rgba(231, 76, 60, 0.1); border-radius: 16px; padding: 30px; text-align: center; border: 1px solid rgba(231, 76, 60, 0.3);">
              <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
              <h3 style="color: #ffffff; margin-bottom: 10px;">Analysis Failed</h3>
              <p style="color: #ffcccb; margin-bottom: 15px;">${error.message}</p>
              <p style="color: #8cc8ff; font-size: 0.9rem;">
                Please check that:
                <ul style="text-align: left; margin-top: 10px; padding-left: 20px;">
                  <li>The Flask server is running on port 5001</li>
                  <li>The image is a valid brain MRI scan</li>
                  <li>Your internet connection is working</li>
                </ul>
              </p>
            </div>
          </div>
        `;
        resultDiv.classList.remove('hidden');
        showToast('Analysis failed. Please check server connection.', 'error');
      }
    });

    function displayResult(data) {
      const info = tumorInfo[data.prediction];
      const confidencePercent = (data.confidence * 100).toFixed(1);
      const processingTime = data.processing_time ? data.processing_time.toFixed(2) : 'N/A';

      let resultColor, resultIcon, resultStatus, urgencyColor;

      if (data.prediction === 'notumor') {
        resultColor = '#2ecc71';
        resultIcon = 'fas fa-check-circle';
        resultStatus = 'No Tumor Detected';
        urgencyColor = '#27ae60';
      } else {
        resultColor = '#e74c3c';
        resultIcon = 'fas fa-exclamation-triangle';
        resultStatus = 'Tumor Detected';
        urgencyColor = info.urgency === 'high' ? '#e74c3c' : info.urgency === 'medium' ? '#f39c12' : '#3498db';
      }

      // Generate confidence bars if confidence_scores exists
      let confidenceBarsHtml = '';
      if (data.confidence_scores) {
        confidenceBarsHtml = `
          <div class="confidence-bars">
            <h3 style="color: #1abc9c; margin-bottom: 15px; font-size: 1.1rem;">
              <i class="fas fa-chart-bar"></i> Confidence Distribution
            </h3>
            ${Object.entries(data.confidence_scores)
            .sort((a, b) => b[1] - a[1])
            .map(([className, score]) => `
                <div class="confidence-bar">
                  <div class="confidence-label">
                    <span>${className.toUpperCase()}</span>
                    <span>${(score * 100).toFixed(1)}%</span>
                  </div>
                  <div class="confidence-bar-bg">
                    <div class="confidence-bar-fill" style="width: ${score * 100}%"></div>
                  </div>
                </div>
              `).join('')}
          </div>
        `;
      }

      resultDiv.innerHTML = `
        <div class="fade-in">
          <div class="result-header">
            <div>
              <div class="result-title" style="color: ${resultColor};">
                <i class="${resultIcon}"></i> ${resultStatus}
              </div>
              <div style="color: #8cc8ff; font-size: 1.1rem; margin-top: 5px;">
                Diagnosis: <strong style="color: white; text-transform: uppercase;">${data.prediction}</strong>
                <span style="margin-left: 10px; padding: 2px 8px; background: ${urgencyColor}; border-radius: 10px; font-size: 0.8rem; color: white;">
                  ${info.urgency.toUpperCase()} URGENCY
                </span>
              </div>
              <div style="color: #8cc8ff; font-size: 0.9rem; margin-top: 5px;">
                <i class="fas fa-clock"></i> Processed in ${processingTime}s
                ${data.request_id ? `<br><i class="fas fa-fingerprint"></i> ID: ${data.request_id}` : ''}
              </div>
            </div>
            <div class="confidence-badge">${confidencePercent}% Confidence</div>
          </div>
          
          <div class="result-details">
            <div class="detail-item">
              <div class="detail-title">
                <i class="fas fa-info-circle"></i> Medical Description
              </div>
              <div class="detail-content">${info.description}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-title">
                <i class="fas fa-prescription-bottle-alt"></i> Treatment Recommendations
              </div>
              <div class="detail-content">${info.prescription}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-title">
                <i class="fas fa-shield-alt"></i> Prevention & Risk Reduction
              </div>
              <div class="detail-content">${info.prevention}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-title">
                <i class="fas fa-clipboard-check"></i> Monitoring & Follow-up
              </div>
              <div class="detail-content">${info.precaution}</div>
            </div>
          </div>
          
          ${confidenceBarsHtml}
          
          <div style="background: rgba(231, 76, 60, 0.1); border-radius: 12px; padding: 20px; margin-top: 30px; border-left: 4px solid #e74c3c;">
            <div style="display: flex; align-items: flex-start; gap: 15px; color: #ffcccb;">
              <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem; margin-top: 3px;"></i>
              <div>
                <strong>Important Medical Disclaimer:</strong> This AI-powered analysis is for educational and research purposes only. It is NOT a substitute for professional medical diagnosis, advice, or treatment. Always consult qualified healthcare providers for medical decisions. Use the map below to find nearby hospitals for professional consultation.
              </div>
            </div>
          </div>
          
          ${data.prediction !== 'notumor' ? `
            <div style="margin-top: 25px; text-align: center;">
              <button class="btn btn-primary" onclick="document.getElementById('map-section').scrollIntoView({behavior: 'smooth'})" style="max-width: 300px; margin: 0 auto;">
                <i class="fas fa-hospital-alt"></i> Find Nearby Hospitals for Treatment
              </button>
            </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 0.8rem; color: #8cc8ff;">
            <div>
              <i class="fas fa-calendar"></i> ${new Date().toLocaleDateString()}
            </div>
            <div>
              <i class="fas fa-server"></i> NeuroScan AI v2.2
            </div>
          </div>
        </div>
      `;

      resultDiv.classList.remove('hidden');
    }

    clearBtn.addEventListener('click', () => {
      imageInput.value = '';
      uploadArea.innerHTML = `
        <div class="upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="upload-text">Drag & Drop your MRI file here</div>
        <div class="upload-subtext">or click to browse (Max 10MB)</div>
      `;
      resultDiv.innerHTML = '';
      resultDiv.classList.add('hidden');
      defaultResult.style.display = 'block';
      loadingDiv.classList.add('hidden');
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<i class="fas fa-bolt"></i> Analyze Scan';
      showToast('Cleared all fields', 'info');
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize map
      initMap();

      // Add some floating particles in background
      const particles = 15;
      for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(26, 188, 156, ${Math.random() * 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.zIndex = '-1';
        document.body.appendChild(particle);

        // Animate
        animateParticle(particle);
      }

      function animateParticle(element) {
        let x = parseFloat(element.style.left);
        let y = parseFloat(element.style.top);
        let xSpeed = (Math.random() - 0.5) * 0.3;
        let ySpeed = (Math.random() - 0.5) * 0.3;

        function move() {
          x += xSpeed;
          y += ySpeed;

          if (x > 100 || x < 0) xSpeed *= -1;
          if (y > 100 || y < 0) ySpeed *= -1;

          element.style.left = x + 'vw';
          element.style.top = y + 'vh';

          requestAnimationFrame(move);
        }

        move();
      }

      // Check backend connection
      checkBackendConnection();
    });

    async function checkBackendConnection() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          console.log('✅ Backend connection successful');
          showToast('Connected to AI analysis server', 'success');
        } else {
          console.warn('⚠️ Backend health check failed');
          showToast('AI server connection unstable', 'warning');
        }
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showToast('Cannot connect to AI server. Make sure Flask is running on port 5001.', 'error');
      }
    }

    // Navigation smooth scrolling
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function (e) {
        if (this.getAttribute('href').startsWith('#')) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Prevent accidental page reload during file upload
    window.addEventListener('beforeunload', (e) => {
      if (loadingDiv.classList.contains('hidden') === false) {
        e.preventDefault();
        e.returnValue = 'Analysis in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    });