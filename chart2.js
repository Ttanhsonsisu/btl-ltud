function getGradient(ctx2, accuracy) {
            const gradient = ctx2.createLinearGradient(0, 0, 300, 0);
            if (accuracy <= 30) {
                gradient.addColorStop(0, "#ff4d4d"); // Đỏ
                gradient.addColorStop(1, "#ff9966");
            } else if (accuracy <= 60) {
                gradient.addColorStop(0, "#ffa500"); // Cam
                gradient.addColorStop(1, "#ffcc66");
            } else {
                gradient.addColorStop(0, "#4caf50"); // Xanh lá
                gradient.addColorStop(1, "#66ff99");
            }
            return gradient;
        }
        
        function renderGaugeChart(accuracy) {
            const ctx2 = document.getElementById('gaugeChart').getContext('2d');
            const colorGradient = getGradient(ctx2, accuracy);
            
            const gaugeChart = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [accuracy, 100 - accuracy],
                        backgroundColor: [colorGradient, '#e0e0e0'],
                        borderWidth: 0,
                    }]
                },
                options: {
                    rotation: -90,
                    circumference: 180,
                    cutout: '70%',
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
            
            const accuracyBox = document.getElementById('accuracyBox');
            accuracyBox.innerText = `Độ chính xác: ${accuracy}%`;
            accuracyBox.style.backgroundColor = colorGradient;
            accuracyBox.style.color = '#fff';
        }
        
        renderGaugeChart(75); // Example accuracy value