const ctx4 = document.getElementById('line').getContext('2d');
ctx4.canvas.width = 350;
ctx4.canvas.height = 350;
const lineChart = new Chart(ctx4, {
    type: 'line',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', "Black"],
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: {
                target: 'origin',
                above: 'rgba(75, 192, 192, 0.2)',   // Area will be red above the origin
                below: 'rgb(0, 0, 255)'    // And blue below the origin
              },
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.3
          }],
          borderWidth: 1
    },
    options: {
        // responsive: false,  // Tắt responsive để giữ nguyên kích thước
        maintainAspectRatio: false,  // Đảm bảo không giữ tỷ lệ khung hình
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});