import { categorys, colors } from "./data.js";
const filterContainer = document.querySelector(".filter-container");
const colorsContainer = document.querySelector(".colors-container");
const range = document.querySelector(".range");
const productsContainer = document.querySelector(".products-container");
const barsContainer = document.querySelector(".bars-container");
const shipping = document.querySelector(".shipping");
const cartItems = document.querySelector(".num-items");
const modal = document.querySelector(".modal");
const totalPrice = document.querySelector(".total-price");
const rangeAmount = document.querySelector(".amount");
const productsArray = [];
const allPorductsArray = [];
const totalPriceArray = [];
let num = 0;
rangeAmount.innerHTML = `${range.value}kr`;
const displayCategory = () => {
  categorys.map((item) => {
    let html = `

        <div class='cat-con'>
        <p>${item}</p>
        </div>
        `;
    filterContainer.insertAdjacentHTML("beforeend", html);
  });

  document.querySelectorAll(".cat-con").forEach((el) => {
    el.addEventListener("click", (e) => {
      displayFiltered(e.target.textContent);
      if (e.target.textContent === "All") {
        colorsContainer.innerHTML = "";
        getData();
      }
    });
  });
};
displayCategory();

const getData = async () => {
  try {
    const resp = await axios("https://course-api.com/react-store-products");
    displayProducts(resp.data);
    const colors = resp.data.map((item) => item.colors);
    const uniq = new Set(colors.flat());
    const newArray = [...uniq];
    newArray.map((color) => {
      let html2 = `
      <div class="col" style="background-color: ${color};">${
        color === "All" ? "All" : ""
      }</div>
      `;
      colorsContainer.insertAdjacentHTML("beforeend", html2);
    });
    document.querySelectorAll(".col").forEach((el) => {
      el.addEventListener("click", (e) => {
        productsContainer.innerHTML = "";
        const currentColor = e.target
          .getAttribute("style")
          .split("background-color: ")[1]
          .split(";")[0];
        const colors = resp.data.filter((item) => {
          return item.colors.includes(currentColor);
        });
        displayProducts(colors);
      });
    });
    const shipping = resp.data.filter((item) => item.shipping);
    productsArray.push(shipping);
    allPorductsArray.push(resp.data);
  } catch (error) {
    console.error(error);
  }
};
getData();
const displayProducts = (data) => {
  data.map((item) => {
    let html = `
        <div class="img-container" id=${item.id}>
          <img src="${item.image}" alt="" />
          <div>
            <h4>${item.name}</h4>
            <p>${item.price}kr</p>
            <button class="add-btn">add</button>
          </div>
        </div>
        `;
    productsContainer.insertAdjacentHTML("beforeend", html);
  });
  document.querySelectorAll(".add-btn").forEach((btn) => {
    let total;
    btn.addEventListener("click", (e) => {
      num++;
      const id = e.target.parentElement.parentElement.id;
      const price = parseInt(
        e.target.parentElement.children[1].textContent.split("kr")[0]
      );
      totalPriceArray.push(price);
      const total = totalPriceArray.reduce((curr, tot) => {
        return curr + tot;
      }, 0);
      totalPrice.innerHTML = `total: ${total}kr`;
      const matching = data.filter((item) => item.id === id);
      cartItems.innerHTML = `${num}`;
      matching.map((item) => {
        let html = `
        <div class="cart-products">
        <img src="${item.image}" />
         <h4>${item.name}</h4>
            <p>${item.price}kr</p>
        </div>
      `;
        modal.insertAdjacentHTML("beforeend", html);
      });
    });
  });
};
document.querySelector(".dot-container").addEventListener("click", (e) => {
  productsContainer.classList.remove("column");
});
barsContainer.addEventListener("click", (e) => {
  productsContainer.classList.add("column");
});

const displayFiltered = async (query) => {
  productsContainer.innerHTML = "";
  try {
    const resp = await axios("https://course-api.com/react-store-products");
    const filtered = resp.data.filter(
      (item) => item.category === query.toLowerCase()
    );

    filtered.map((item) => {
      let html = `
        <div class="img-container">
          <img src="${item.image}" alt="" />
          <div>
            <h4>${item.name}</h4>
            <p>${item.price}kr</p>
          </div>
        </div>
        `;
      productsContainer.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error(error);
  }
};

document.querySelectorAll("option").forEach((option) => {
  option.addEventListener("click", (e) => {
    sortByPrice(e.target.textContent);
  });
});

const sortByPrice = async (query) => {
  productsContainer.innerHTML = "";
  try {
    const resp = await axios("https://course-api.com/react-store-products");
    const highestPrice = resp.data.sort((a, b) => a.price - b.price);
    const lowestPrice = resp.data.sort((a, b) => b.price - a.price);
    if (query.toLowerCase() === "highest") {
      displayProducts(highestPrice);
    }
    if (query.toLowerCase() === "lowest") {
      displayProducts(lowestPrice);
    }
  } catch (error) {
    console.error(error);
  }
};

document.querySelector(".clear").addEventListener("click", (e) => {
  productsContainer.innerHTML = "";
  colorsContainer.innerHTML = "";
  getData();
});

document.querySelector(".shipping").addEventListener("click", (e) => {
  productsContainer.innerHTML = "";
  if (e.target.checked) {
    displayProducts(productsArray[0]);
  } else {
    displayProducts(allPorductsArray[0]);
  }
});

document.querySelector(".search").addEventListener("input", (e) => {
  e.preventDefault();
  displayFiltered(e.target.value);
});

document.querySelector(".cart-container").addEventListener("click", (e) => {
  modal.classList.toggle("hidden");
});

range.addEventListener("change", (e) => {
  console.log(e.target.value);
  rangeAmount.innerHTML = `${e.target.value}kr`;
  const priceRange = allPorductsArray[0].filter(
    (item) => item.price < e.target.value
  );
  productsContainer.innerHTML = "";
  displayProducts(priceRange);
});
