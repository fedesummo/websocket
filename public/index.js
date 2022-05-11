let email = localStorage.getItem("email");
while (!email) {
  email = prompt("Type your email address below...");
  email && localStorage.setItem("email", email);
}

document.querySelector("#email-box").innerHTML = email;

const socket = io();

const renderProducts = (data) => {
  const html = data
    .map(
      (element) => `<tr>
                    <td>${element.id}</td>
                    <td>${element.title}</td>
                    <td>
                        <img
                            src="${element.thumbnail}"
                            style="height: 9rem;"
                        />
                    </td>
                    <td>$ ${element.price}</td>
                 </tr>`,
    )
    .join(" ");
  document.querySelector("#tbody").innerHTML = html;
};

const postProduct = () => {
  const { value: title } = document.querySelector("input[name='title']");
  const { value: thumbnail } = document.querySelector(
    "input[name='thumbnail']",
  );
  const { value: price } = document.querySelector("input[name='price']");
  socket.emit("post_product", { title, thumbnail, price });
};

socket.on("products_list", (data) => renderProducts(data));

const productsFormRef = document.querySelector("#productsForm");
productsFormRef.onsubmit = (event) => {
  event.preventDefault();
  postProduct();
  productsFormRef.reset();
};

const renderMessages = (data) => {
  const html = data
    .map(
      (element) => `
            <p>
                <span class="fw-bold">${element.email} </span>
                <span class="text-danger">[${element.timestamp}]: </span>
                <span>${element.message}</span>
            </p>
        `,
    )
    .join(" ");
  document.querySelector("#messages-box").innerHTML = html;
};

const postMessage = () => {
  const { value: message } = document.querySelector("input[name='message']");
  const timestamp = new Date().toLocaleString("en-GB");
  socket.emit("post_message", { email, message, timestamp });
};

socket.on("messages_list", (data) => renderMessages(data));

const messagesFormRef = document.querySelector("#messagesForm");
messagesFormRef.onsubmit = (event) => {
  event.preventDefault();
  postMessage();
  messagesFormRef.reset();
};
