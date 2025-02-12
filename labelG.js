// Lấy các phần tử HTML
const fetchButton = document.getElementById('fetchButton');
const labelDisplay = document.getElementById('labelDisplay');

// Định nghĩa các label tương ứng
const labels = {
  0: { text: "Negative", className: "negative" },
  1: { text: "Positive", className: "positive" },
  2: { text: "Neutral", className: "neutral" },
  3: { text: "Irrelevant", className: "irrelevant" }
};

// Hàm fetch data từ API
async function fetchData() {
  try {
    // Giả lập API endpoint (bạn có thể thay bằng API thực tế)
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();

    // Giả sử API trả về một trường `label` với giá trị 0, 1, 2, hoặc 3
    const labelValue = data.id % 4; // Giả lập giá trị label (0-3)

    // Hiển thị label và màu sắc tương ứng
    labelDisplay.textContent = labels[labelValue].text;
    labelDisplay.className = `label-box ${labels[labelValue].className}`;
  } catch (error) {
    console.error('Error fetching data:', error);
    labelDisplay.textContent = "Error fetching data!";
    labelDisplay.className = "label-box";
  }
}

// Gắn sự kiện click cho nút
fetchButton.addEventListener('click', fetchData);