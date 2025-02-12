// script.js
var dataFetch;

// document.getElementById('send-btn').addEventListener('click', processInput);
document.getElementById('chat-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        processInput().then(data => {
            dataFetch = data;
            console.log("Dữ liệu nhận được:", dataFetch);
            handleChart(dataFetch);

        });
        handleGraphChart();
    }
});

async function processInput() {
    const input = document.getElementById('chat-input');
    // const text = input.value.trim();
    const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: input.value
        })
    });
    const data = await response.json();
    console.log(data);
    return data;
}
const handleChart = (dataFetch) => {

    // display label
    displayResult(dataFetch.label);
    // chart 1

    // Đếm số từ theo loại POS
    const posCounts = {};
    dataFetch.analysis.forEach(item => {
        const pos = item.pos;
        posCounts[pos] = (posCounts[pos] || 0) + 1;
    });
    // Chuyển đổi dữ liệu thành mảng để đưa vào biểu đồ
    const labels = Object.keys(posCounts);
    const counts = Object.values(posCounts);

    const ctx = document.getElementById('barchart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng từ theo POS',
                data: counts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    //
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    //
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                // backgroundColor: 'rgba(54, 162, 235, 0.5)',
                // borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

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


    // chart 2
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
    const confidence = (dataFetch.confidence * 100).toFixed(2);
    renderGaugeChart(confidence); // Example accuracy value

    // chart 3
    const wordFrequency = countWordFrequency(dataFetch.analysis);

    // Chuyển đổi dữ liệu thành mảng labels và values
    const labels3 = Object.keys(wordFrequency);  // Các từ (labels)
    const dataValues3 = Object.values(wordFrequency);  // Tần suất xuất hiện (data)

    const ctx4 = document.getElementById('line').getContext('2d');
    ctx4.canvas.width = 350;
    ctx4.canvas.height = 350;
    const lineChart = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: labels3,
            datasets: [{
                label: 'Tần suất xuất hiện của từ',
                data: dataValues3,
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

    // chart 4
    // const ctx3 = document.getElementById('doughnut').getContext('2d');
    // ctx3.canvas.width = 350;
    // ctx3.canvas.height = 350;
    // const doughnutChart = new Chart(ctx3, {
    //     type: 'doughnut',
    //     data: {
    //         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //         datasets: [{
    //             label: '# of Votes',
    //             data: [12, 19, 3, 5, 2, 3],
    //             backgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(255, 206, 86, 0.2)',
    //                 'rgba(75, 192, 192, 0.2)',
    //                 'rgba(153, 102, 255, 0.2)',
    //                 'rgba(255, 159, 64, 0.2)'
    //             ],
    //             borderColor: [
    //                 'rgba(255, 99, 132, 1)',
    //                 'rgba(54, 162, 235, 1)',
    //                 'rgba(255, 206, 86, 1)',
    //                 'rgba(75, 192, 192, 1)',
    //                 'rgba(153, 102, 255, 1)',
    //                 'rgba(255, 159, 64, 1)'
    //             ],
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         // responsive: false,  // Tắt responsive để giữ nguyên kích thước
    //         maintainAspectRatio: false,  // Đảm bảo không giữ tỷ lệ khung hình
    //         scales: {
    //             y: {
    //                 beginAtZero: true
    //             }
    //         }
    //     }
    // });
}

const handleGraphChart = () => {
    // Kích thước SVG
    const width = 400; // Điều chỉnh kích thước
    const height = 400; // Điều chỉnh kích thước

    // Tạo SVG container
    const svg = d3.select("svg")
      .attr("width", width)
      .attr("height", height);
    const input = document.getElementById('chat-input');
    var textInput = input.value;
    // Hàm gọi API và hiển thị đồ thị
    function fetchData(textI) {
      const sentence = textI || "The company is developing a new product.";

      // Gọi API bằng POST
      fetch("http://127.0.0.1:8000/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: sentence }),
      })
        .then(response => response.json())
        .then(data => {
          const nodes = data.nodes;
          const links = data.links;

          // Xóa đồ thị cũ
          svg.selectAll("*").remove();

          // Tạo force simulation
      const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(30)) // Giảm khoảng cách
      .force("charge", d3.forceManyBody().strength(-100)) // Giảm lực đẩy
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.1)) // Tăng lực hấp dẫn
      .force("boundary", () => {
        nodes.forEach(node => {
          // Giới hạn node trong khung SVG
          node.x = Math.max(10, Math.min(width - 10, node.x));
          node.y = Math.max(10, Math.min(height - 10, node.y));
        });
      });

          // Vẽ các đường liên kết
          const link = svg.selectAll(".link")
            .data(links)
            .enter().append("line")
            .attr("class", "link");

          // Vẽ các node
          const node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 6); // Giảm kích thước node

          // Thêm nhãn cho các node
          const label = svg.selectAll(".label")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .text(d => d.id);

          // Cập nhật vị trí các phần tử trong mỗi tick
          simulation.on("tick", () => {
            link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);

            node
              .attr("cx", d => d.x)
              .attr("cy", d => d.y);

            label
              .attr("x", d => d.x)
              .attr("y", d => d.y);
          });
        })
        .catch(error => console.error("Error fetching data:", error));
    }

    // Gọi hàm fetchData lần đầu để hiển thị đồ thị mặc định
    fetchData(textInput);
//     const width = 400;
//     const height = 400;

//     // Tạo scene, camera và renderer
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(width, height);
//     document.body.appendChild(renderer.domElement);

//     // Đặt vị trí camera
//     camera.position.z = 200;

//     // Tạo các node và links
//     let nodes = [];
//     let links = [];

//     // Hàm tạo node (hình cầu)
//     function createNode(x, y, z, color) {
//         const geometry = new THREE.SphereGeometry(2, 16, 16);
//         const material = new THREE.MeshBasicMaterial({ color });
//         const sphere = new THREE.Mesh(geometry, material);
//         sphere.position.set(x, y, z);
//         scene.add(sphere);
//         return sphere;
//     }

//     // Hàm tạo link (đường thẳng)
//     function createLink(source, target, color) {
//         const geometry = new THREE.BufferGeometry().setFromPoints([source.position, target.position]);
//         const material = new THREE.LineBasicMaterial({ color });
//         const line = new THREE.Line(geometry, material);
//         scene.add(line);
//         return line;
//     }
//         const input = document.getElementById('chat-input');
//         var textInput = input.value;
//     // Hàm gọi API và hiển thị đồ thị
//     function fetchData(t) {
//         const sentence = t; // Có thể thay bằng input từ người dùng

//         // Gọi API bằng POST
//         fetch("http://127.0.0.1:8000/parse", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ text: sentence }),
//         })
//             .then(response => response.json())
//             .then(data => {
//                 const { nodes: nodeData, links: linkData } = data;

//                 // Tạo các node
//                 nodes = nodeData.map((node, i) => {
//                     const angle = (i / nodeData.length) * Math.PI * 2;
//                     const x = Math.cos(angle) * 50;
//                     const y = Math.sin(angle) * 50;
//                     const z = 0;
//                     return createNode(x, y, z, 0x69b3a2);
//                 });

//                 // Tạo các link
//                 links = linkData.map(link => {
//                     const source = nodes.find(node => node.userData.id === link.source);
//                     const target = nodes.find(node => node.userData.id === link.target);
//                     return createLink(source, target, 0x999999);
//                 });
//             })
//             .catch(error => console.error("Error fetching data:", error));
//     }

//     // Hàm xoay đồ thị
//     function rotateGraph() {
//         scene.rotation.x += 0.005;
//         scene.rotation.y += 0.005;
//     }

//     // Hàm render
//     function animate() {
//         requestAnimationFrame(animate);
//         rotateGraph();
//         renderer.render(scene, camera);
//     }

//     // Khởi tạo đồ thị và bắt đầu animation
//     fetchData(textInput);
//     animate();
}


// Hàm đếm số lần xuất hiện của từng từ
function countWordFrequency(words) {
    const frequency = {};
    words.forEach(({ word }) => {
        const lowerWord = word.toLowerCase(); // Chuyển về chữ thường để tránh trùng lặp từ hoa/thường
        frequency[lowerWord] = (frequency[lowerWord] || 0) + 1;
    });
    return frequency;
}

// Hàm hiển thị kết quả phân loại cảm xúc
function displayResult(label) {
    const labelContainer = document.getElementById('lable-prifix');
    labelContainer.innerHTML = ''; // Xóa nội dung cũ

    // Định nghĩa các nhãn phân loại
    const categories = {
        "Negative": "Tiêu cực",
        "Positive": "Tích cực",
        "Neutral": "Trung lập",
        "Irrelevant": "Không liên quan"
    };

    const resultText = categories[label] || label; // Nếu không có trong danh sách, giữ nguyên

    // Tạo phần tử hiển thị
    const resultElement = document.createElement('div');
    resultElement.className = 'result-label';
    resultElement.textContent = `Phân loại: ${resultText}`;

    labelContainer.appendChild(resultElement);
}