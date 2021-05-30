const baseURL = `http://localhost:3000/api`
const baseURLForStores = `${baseURL}/Stores` 
const $main = document.querySelector("#main")
const $sectionTitle = document.querySelector(".js-header-title")
const $tableTitle = document.querySelector(".table-title")
const $firstSectionHeader = document.querySelector(".first-header-section")
const $secondSectionHeader = document.querySelector(".second-header-section")
const $articles = document.querySelector(".js-articles");
const $tableWrap = document.querySelector(".table-wrapper")
const $storesSearchInput = document.querySelector(".stores-search-input")
const $productsSearchInput = document.querySelector(".products-search-input")
const $headerText = document.querySelector(".header-text")
const $headerOk = document.querySelector(".header-ok")
const $headerStorage = document.querySelector(".header-storage")
const $headerOut = document.querySelector(".header-out")
const $btnCrossStores = document.querySelector(".icon-cross-stores")
const $btnCrossProduct = document.querySelector(".icon-cross-products")
const $modalCreateStore = document.querySelector(".modal-wrapper-create-store")
const $modalCreateProduct = document.querySelector(".modal-wrapper-create-product")
const $formCreateStore = document.querySelector("#formCreateStore")
const $btnCreateStore = document.querySelector(".btn-create-store-create")
const $btnDeleteStore = document.querySelector(".delete-store")
const $formCreateProduct = document.querySelector("#formCreateProduct")
const $btnCreateProduct =  document.querySelector(".btn-create-product-create")
const $confirmDeleteProduct = document.querySelector(".modal-wrapper-confirm-delete-product")
const $confirmDeleteStore = document.querySelector(".modal-wrapper-confirm-delete-store")
const $popup = document.querySelector(".popup")
const $btnRefreshProducts = document.querySelector(".icon-refresh-products")
const $btnRefreshStores = document.querySelector(".icon-refresh-stores")
const $btnCrossProducts = document.querySelector(".icon-cross-products")
let storeID
let productID
let desc = false
let errors = false
let searchStringForStores = ""
let searchStringForProducts = ""


function sendRequest (method, url) {
	return fetch(url).then(response => {
		if (response.status <= 400){
			return response.json()
		}
		if (response.status = 404){
			const $main = document.querySelector("#main")
			$main.innerHTML = `<h4>404 Not found</h4>`
		}
		return response.json().then(error => {
			const e = new Error("Error")
			e.data = error
			throw e
		})
	})
}

function onLoadStores () {
	return this
		.sendRequest("GET", `${baseURLForStores}`)
		.then(dataOfStores => {
			return dataOfStores
		})
}

function onSearchStores (searchStringForStores) {
	return this
		.sendRequest("GET", `${baseURLForStores}?filter[where]
		[or][0][Name][regexp]=^${searchStringForStores}/i&filter[where]
		[or][1][Address][regexp]=^${searchStringForStores}/i&filter[where]
		[or][2][FloorArea][like]=${searchStringForStores}`)
		.then(dataOfStores => {
			return dataOfStores
		})
}

function onloadProducts (storeID, path = ``){
	return this
		.sendRequest("GET", `${baseURLForStores}/${storeID}/rel_Products${path}`)
		.then(dataOfProducts => {
			return dataOfProducts
		}) 
}


function onSearchProducts (storeID, searchStringForProducts){
	return this
		.sendRequest("GET", `${baseURLForStores}/${storeID}/rel_Products?filter[where]
		[or][0][Name][regexp]=^${searchStringForProducts}/i&filter[where]
		[or][1][Specs][regexp]=^${searchStringForProducts}/i&filter[where]
		[or][2][SupplierInfo][regexp]=^${searchStringForProducts}/i&filter[where]
		[or][3][MadeIn][regexp]=^${searchStringForProducts}/i&filter[where]
		[or][4][ProductionCompanyName][regexp]=^${searchStringForProducts}/i&filter[where]
		[or][5][Price][like]=${searchStringForProducts}`)
		.then(dataOfProducts => {
			return dataOfProducts
		}) 
}

function sendRequestForCreate (obj, path = ``) {
	return fetch(`${baseURLForStores}/${path}`, {
        method: 'POST',
        body:JSON.stringify(obj),
        headers:{'content-type': 'application/json'}})
}

function sendRequestForDelete (url) {
	return fetch(url, {
		method: "DELETE",
	})
}

function sendRequestForDeleteStore (storeID) {
	return this
		.sendRequestForDelete(`${baseURLForStores}/${storeID}`)
		.then()
}

function sendRequestForDeleteProduct (storeID, productID) {
	return this
		.sendRequestForDelete(`${baseURLForStores}/${storeID}/rel_Products/${productID}`)
		.then()
}

function sortArrayBy (array, sort, desc) {

	array.sort((a, b) => (a[sort] < b[sort]) ? -1 : 1)
	if (desc) array.reverse()
	return array
}

function renderStores(arr) {

    const $articles = document.querySelector(".js-articles")
    $articles.innerHTML = ""

    for (let el of arr) {
        $articles.innerHTML += `<article class="article store-item" about=${el.id}>
            <div class="article-content-main">
                <p class="shop-name long-text">${el.Name}</p>
                <div>
                    <p>${el.FloorArea}</p>
                    <p class="sq-m">sq.m</p>
                </div>
            </div>
            <div>
                <p class="shop-address">${el.Address}</p>
            </div>
        </article>`
    }
}

function showSectionWithoutProducts() {

    $sectionTitle.innerHTML = "Store is not selected"
    $tableWrap.innerHTML = `<div class="table-without-products">
        <i class="fas fa-store-alt"></i>
        <p class="title">The store is not selected</p>
        <p class="text-grey">Please select the store to proceed</p>
    </div>`

    $firstSectionHeader.classList.remove("active")
    $secondSectionHeader.classList.remove("active")
    $tableTitle.classList.remove("active")
}

function renderProductTable(arr) {

    $sectionTitle.classList.remove("center")
    $tableTitle.classList.add("active")
    $sectionTitle.innerHTML = "Stores Details"
    $tableWrap.innerHTML = `<table class="table">
        <thead class="thead">
            <tr>
                <th class="th table-nav-name"><i class="fas fa-sort"></i>Name</th>
                <th class="th table-nav-price table-product-price"><i class="fas fa-sort"></i>Price</th>
                <th class="th table-nav-specs"><i class="fas fa-sort"></i>Specs</th>
                <th class="th table-nav-supplierinfo"><i class="fas fa-sort"></i>SupplierInfo</th>
                <th class="th table-nav-country country-none"><i class="fas fa-sort"></i>Country of origin</th>
                <th class="th table-nav-company company-none"><i class="fas fa-sort"></i>Prod. company</th>
                <th class="th table-nav-rating rating-none"><i class="fas fa-sort"></i>Rating</th>
            </tr>
        </thead>
        <tbody class="tbody"></tbody>
    </table>`

    const $tbody = document.querySelector(".tbody")

    const rating1 = `
    <i class="fas fa-star"></i>
    <i class="far fa-star"></i>
    <i class="far fa-star"></i>
    <i class="far fa-star"></i>
    <i class="far fa-star"></i>`

    const rating2 = `
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="far fa-star"></i>
    <i class="far fa-star"></i>
    <i class="far fa-star"></i>`

    const rating3 = `
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="far fa-star"></i>
    <i class="far fa-star"></i>`

    const rating4 = `
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="far fa-star"></i>`

    const rating5 = `
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>`

    for (let el of arr) {
        $tbody.innerHTML += `<tr id=${el.id}>
            <td>
                <p class="table-products-name long-text">${el.Name}</p>
                <p>${el.id}</p>
            </td>
            <td class="table-product-price" nowrap>
                <p><span>${el.Price}</span> USD</p>
            </td>
            <td class="long-text">
                <p title="${el.Specs}">${el.Specs}</p>
            </td>
            <td class="long-text">
                <p title="${el.SupplierInfo}">${el.SupplierInfo}</p>
            </td>
            <td class="long-text country-none">
                <p>${el.MadeIn}</p>
            </td>
            <td class="long-text company-none">
                <p>${el.ProductionCompanyName}</p>
            </td>
            <td class="rating-none">
                <div class="rating">
                        <div>
                            ${el.Rating === 1 ? rating1 :
                            el.Rating === 2 ? rating2 :
                            el.Rating === 3 ? rating3 :
                            el.Rating === 4 ? rating4 :
                            el.Rating === 5 ? rating5 : null}
                        </div>
                        <div class="for-id-product" about=${el.id} nowrap>
							<i class="far fa-times-circle delete-product"></i>
						</div>
                </div>
            </td>
        </tr>`
    }
}

function renderHeaderWithInfoAboutStore(obj) {

    $firstSectionHeader.classList.add("active")
    $firstSectionHeader.innerHTML = `<div class="header-content">
    <div class="header-content-col">
        <div class="header-cont-string">
            <p class="header-cont-col-bold">Email: </p>
            <p>${obj.Email}</p>
        </div>
        <div class="header-cont-string">
            <p class="header-cont-col-bold">Phone Number: </p>
            <p>${obj.PhoneNumber}</p>
        </div>
        <div class="header-cont-string">
            <p class="header-cont-col-bold">Address: </p>
            <p>${obj.Address}</p>
        </div>
    </div>
    <div class="header-content-col">
        <div class="header-cont-string">
            <p class="header-cont-col-bold">Established Date:</p>
            <p>${obj.Established.slice(5, 7) === '01' ? 'Jan' :
            obj.Established.slice(5, 7) === '02' ? 'Feb' :
            obj.Established.slice(5, 7) === '03' ? 'Mar' :
            obj.Established.slice(5, 7) === '04' ? 'Apr' :
            obj.Established.slice(5, 7) === '05' ? 'May' :
            obj.Established.slice(5, 7) === '06' ? 'Jnn' :
            obj.Established.slice(5, 7) === '07' ? 'Jnl' :
            obj.Established.slice(5, 7) === '08' ? 'Aug' :
            obj.Established.slice(5, 7) === '09' ? 'Sep' :
            obj.Established.slice(5, 7) === '10' ? 'Oct' :
            obj.Established.slice(5, 7) === '11' ? 'Nov' :
            obj.Established.slice(5, 7) === '12' ? 'Dec' : null}
            ${obj.Established.slice(8, 10)}, ${obj.Established.slice(0, 4)} </p>
        </div>
        <div class="header-cont-string">
            <p class="header-cont-col-bold">Floor Area:</p>
            <p>${obj.FloorArea}</p>
        </div>
    </div>
</div>`
}

function renderHeaderWithStatusOfProducts(arr) {

    const $storeAmount = document.querySelector(".store-amount")
    const $statusOk = document.querySelector(".status-ok")
    const $statusStorage = document.querySelector(".status-storage")
    const $statusOut = document.querySelector(".status-out")

    let statusOk = 0
    let statusStorage = 0
    let statusOut = 0

    for (let el of arr) {
        if (el.Status === "OUT_OF_STOCK") {
            statusOut += 1
        } else if (el.Status === "OK") {
            statusOk += 1
        } else if (el.Status === "STORAGE") {
            statusStorage += 1
        } else {
            return null
        }
    }
    $secondSectionHeader.classList.add("active")
    $storeAmount.innerHTML = `${arr.length}`
    $statusOk.innerHTML = `${statusOk}`
    $statusStorage.innerHTML = `${statusStorage}`
    $statusOut.innerHTML = `${statusOut}`

    clearClassBtnByStatus()
    $headerText.classList.add("active")

}

function clearClassBtnByStatus() {

    $headerText.classList.remove("active")
    $headerOk.classList.remove("active")
    $headerStorage.classList.remove("active")
    $headerOut.classList.remove("active")
}

function clearForm(form) {
    const $inputs = form.getElementsByTagName("input")
    for (let $input of $inputs) {
        $input.classList.remove("error")
        $input.value = ''
    }
    document.getElementById("phone-message").innerHTML = ""
    document.getElementById("email-message").innerHTML = ""
}

function clearSearchInput (input, btnCross, btnRefresh) {
	input.value = ""
	btnCross.classList.add("non-active")
	btnRefresh.classList.remove("non-active")
}

function showPreloader (elem) {
	elem.innerHTML = `
	<div class="preloader">
        <img src="./assets/images/preloader.gif" alt="">
    </div>`
}

function formCreateProductValues () {

    let name = $formCreateProduct.querySelector('[name="Name"]')
    let price = $formCreateProduct.querySelector('[name="Price"]')
    let specs = $formCreateProduct.querySelector('[name="Specs"]')
    let rating = $formCreateProduct.querySelector('[name="Rating"]')
    let supplierInfo = $formCreateProduct.querySelector('[name="SupplierInfo"]')
    let madeIn = $formCreateProduct.querySelector('[name="MadeIn"]')
    let productionCompanyName = $formCreateProduct.querySelector('[name="ProductionCompanyName"]')
    let status = $formCreateProduct.querySelector('[name="Status"]')

	let obj = {
        Name: name.value,
        Price: price.value,
        Photo: name.value,
        Specs: specs.value,
        Rating: rating.value,
        SupplierInfo: supplierInfo.value,
        MadeIn: madeIn.value,
        ProductionCompanyName: productionCompanyName.value,
        Status: status.value,
    }
    return obj
}

function formCreateStoreValues () {

    let name = $modalCreateStore.querySelector('[name="Name"]')
    let email = $modalCreateStore.querySelector('[name="Email"]')
    let phoneNumber = $modalCreateStore.querySelector('[name="PhoneNumber"]')
    let address = $modalCreateStore.querySelector('[name="Address"]')
    let established = $modalCreateStore.querySelector('[name="Established"]')
    let floorArea = $modalCreateStore.querySelector('[name="FloorArea"]')
    
    let obj = {
        Name: name.value,
        Email: email.value,
        PhoneNumber: phoneNumber.value,
        Address: address.value,
        Established: established.value,
        FloorArea: floorArea.value,
        id: established.value,
    }
    return obj
}



function loadDocument () {
	onLoadStores()
	.then(function (dataOfStores){
		renderStores (dataOfStores)
		showSectionWithoutProducts()
		getCurrentStore()
	})}

function getCurrentStore () {
		
	onLoadStores()
	.then(function (dataOfStores){
		const $articleItems = document.querySelectorAll(".store-item")
		
        $articleItems.forEach(fetchStore)

		function fetchStore(article) {

			article.addEventListener("click", function () {

				let currentArticle = article
				if (!currentArticle.classList.contains("active")) {
					$articleItems.forEach(function (item) {
						item.classList.remove("active")
					})
					currentArticle.classList.add("active")

					const articleArray = Array.from($articleItems)
					for (let el of articleArray) {
						if (el.classList.contains("active")) {
							storeID = +el.getAttribute("About")
						}
						$productsSearchInput.value = ""
					}
                    showPreloader($tableWrap)
					onloadProducts(storeID)
					.then( function (dataOfProducts) {
						renderProductTable(dataOfProducts)
						renderHeaderWithStatusOfProducts(dataOfProducts)
					})

					let currentStore

					for (let el of dataOfStores){
						if (el.id === storeID){
									currentStore = el
						}
					}
					renderHeaderWithInfoAboutStore(currentStore)
				}
			})
		}
	})
}


function showProductsForStatus (status) {

	if (!status) {
        showPreloader($tableWrap)
		onloadProducts(storeID)
		.then( function (dataOfProducts) {
			renderProductTable(dataOfProducts)
		})
	} else {
        showPreloader($tableWrap)
		onloadProducts(storeID, `?filter=%7B%22where%22%3A%20%7B%22Status%22%3A%20%22${status.toUpperCase()}%22%7D%7D`)
		.then( function (dataOfProducts) {
			renderProductTable(dataOfProducts)
		})
	}
}


function getSort (param) {
	onloadProducts(storeID, ``)
	.then(dataOfProducts => {
		let array = sortArrayBy(dataOfProducts, param, desc)
		renderProductTable(array)
		desc = !desc
	})	
}


function createStore () {

	if (!errors) {

        let obj = formCreateStoreValues()
        
        sendRequestForCreate(obj)
		.then(function (response) {
			if (response.status <= 400){
				clearForm($modalCreateStore)
                $modalCreateStore.classList.remove("active")
				onLoadStores()
				.then(function (dataOfStores){
					getCurrentStore()
					renderStores (dataOfStores)
				})
			}
		})    

		errors = false
	}
}

function deleteStore () {
        
	sendRequestForDeleteStore(storeID)
    .then(function() {
        return onLoadStores()
    })
    .then(function(dataOfStores) {
        renderStores(dataOfStores)
        showSectionWithoutProducts()
        getCurrentStore()
    })
}

function createProduct () {

    if (!errors) {

        let obj = formCreateProductValues()

        sendRequestForCreate(obj, `${storeID}/rel_Products`)
        .then(function (response) {
            if (response.status <= 400){
                clearForm($modalCreateProduct)
                $modalCreateProduct.classList.remove("active")
                $popup.innerHTML = `<p>The product has been successfully created!</p>`
                $popup.classList.add("active")
                    setTimeout(() => {
                            $popup.classList.remove("active")
                    }, 2000)
                onloadProducts(storeID)
                .then(function (dataOfProducts){
                    renderHeaderWithStatusOfProducts(dataOfProducts)
                    renderProductTable (dataOfProducts)
                })

            }
        })
        
        errors = false
    }
}

function deleteProduct () {
	
	sendRequestForDeleteProduct(storeID, productID)
	.then(function() {
	$popup.innerHTML = `<p>The product has been successfully deleted!</p>`
	$popup.classList.add("active")
        setTimeout(() => {
            $popup.classList.remove("active")
        }, 2000)
		return onloadProducts(storeID)
	})
	.then(function (dataOfProducts) {
		renderProductTable(dataOfProducts)
		renderHeaderWithStatusOfProducts(dataOfProducts)
	})
}

function getProductID () {

    const $btnDeleteProduct = document.querySelectorAll(".for-id-product")
    $btnDeleteProduct.forEach(fetchProduct)

        function fetchProduct(product) {

            product.addEventListener("click", function () {

                let currentProductTr = product
                if (!currentProductTr.classList.contains("active")) {
                    $btnDeleteProduct.forEach(function (product) {
                        product.classList.remove("active")
                    })
                    currentProductTr.classList.add("active")
                    const productArray = Array.from($btnDeleteProduct)

                    for (let el of productArray) {
                        if (el.classList.contains("active")) {
                            productID = +el.getAttribute("About")
                            $confirmDeleteProduct.classList.add("active")
                            el.classList.remove("active")
                        }
                    }
                }
            })
        }
}

function validate (form, fn) {

	const $inputs = form.getElementsByTagName("input")
	errors = false
	for (let $input of $inputs) {
		$input.classList.remove("error")
		if (!$input.value) {
			errors = true
			$input.classList.add("error")
		}
	}
	const $emailInput = document.getElementById("email")
	const re = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i
	let emailText = $emailInput.value
	let valid = re.test(emailText)
	if (!valid) {
		$emailInput.classList.add("error")
		document.getElementById("email-message").innerHTML = "example: hi@gmail.com"
		errors = true
	}

	if (!errors) {
		fn
	}
}

function searchStores () {

    showPreloader($articles)
	onSearchStores(searchStringForStores)
	.then(dataOfStores => {
		renderStores(dataOfStores)
		getCurrentStore()
		searchStringForStores = ""
	})
}

function clearSearchInputStores () {

	onLoadStores()
	.then(dataOfStores => {
		renderStores(dataOfStores)
		getCurrentStore()
		clearSearchInput($storesSearchInput, $btnCrossStores, $btnRefreshStores)
	})		
}

function getValueFromSearchInputStores (e) {
		
	searchStringForStores = e.target.value.toLowerCase()
	return searchStringForStores
}

function getValueFromSearchInputProducts (e) {
		
	searchStringForProducts = e.target.value.toLowerCase()
	return searchStringForProducts
}

function searchProducts () {

    showPreloader($tableWrap)
	onSearchProducts(storeID, searchStringForProducts)
	.then(dataOfProducts => {
		renderProductTable(dataOfProducts)
		getCurrentStore()
		searchStringForProducts = ""
	})
}

function clearSearchInputProducts () {

	onloadProducts(storeID)
	.then(dataOfProducts => {
		renderProductTable(dataOfProducts)
		getCurrentStore()
		clearSearchInput($productsSearchInput, $btnCrossProducts, $btnRefreshProducts)
	})		
}



window.addEventListener("load", loadDocument())
$tableWrap.addEventListener("click", getProductID);
$storesSearchInput.addEventListener("change", getValueFromSearchInputStores)
$btnCrossStores.addEventListener("click", clearSearchInputStores)
$productsSearchInput.addEventListener("change", getValueFromSearchInputProducts)
$btnCrossProducts.addEventListener("click", clearSearchInputProducts)


document.addEventListener("click", function (e) {
    
    if (e.target.classList.contains("stores-search-input")) {
		$btnRefreshStores.classList.add("non-active")
		$btnCrossStores.classList.remove("non-active")
	}
	if (e.target.classList.contains("products-search-input")) {
		$btnRefreshProducts.classList.add("non-active")
		$btnCrossProducts.classList.remove("non-active")
	}
    if (e.target.classList.contains("footer-btn-create-store")) {
		$modalCreateStore.classList.add("active")
	}
	if (e.target.classList.contains("footer-btn-create-product") && storeID > 0) {
		$modalCreateProduct.classList.add("active")
	}
	if (e.target.classList.contains("btn-create-store-cancel")) {
		clearForm($modalCreateStore)
		$modalCreateStore.classList.remove("active")
	}
	if (e.target.classList.contains("btn-create-product-cancel")) {
		clearForm($modalCreateProduct)
		$modalCreateProduct.classList.remove("active")
	}
	if (e.target.classList.contains("btn-create-store-create")) {
		validate($modalCreateStore, createStore())
	}
	if (e.target.classList.contains("btn-create-product-create")) {
		validate($modalCreateProduct, createProduct())
	}
	if (e.target.classList.contains("delete-store") && storeID >= 0){
		$confirmDeleteStore.classList.add("active")
	}
	if (e.target.classList.contains("btn-confirm-del-store-ok")){
		$confirmDeleteStore.classList.remove("active")
		deleteStore()
	}
	if (e.target.classList.contains("btn-confirm-del-store-cancel")){
		$confirmDeleteStore.classList.remove("active")
	}
	if (e.target.classList.contains("btn-confirm-del-prod-ok")){
		$confirmDeleteProduct.classList.remove("active")
		deleteProduct()
	}
	if (e.target.classList.contains("btn-confirm-del-prod-cancel")){
		$confirmDeleteProduct.classList.remove("active")
	}
    if (e.target.classList.contains("table-nav-name")) {
		getSort("Name")
	}
	if (e.target.classList.contains("table-nav-price")) {
		getSort("Price")
	}
	if (e.target.classList.contains("table-nav-specs")) {
		getSort("Specs")
	}
	if (e.target.classList.contains("table-nav-supplierinfo")) {
		getSort("SupplierInfo")
	}
	if (e.target.classList.contains("table-nav-country")) {
		getSort("MadeIn")
	}
	if (e.target.classList.contains("table-nav-company")) {
		getSort("ProductionCompanyName")
	}
	if (e.target.classList.contains("table-nav-rating")) {
		getSort("Rating")
	}
    if (e.target.classList.contains("icon-search-stores")) {
		searchStores()
	}
    if (e.target.classList.contains("icon-search-products")) {
		searchProducts()
        clearClassBtnByStatus()
        $headerText.classList.add("active")
	}
    if (e.target.classList.contains("header-text")) {
        clearClassBtnByStatus()
        $headerText.classList.add("active")
        showProductsForStatus()
        $productsSearchInput.value = ""
    }
    if (e.target.classList.contains("header-ok")) {
        clearClassBtnByStatus()
        $headerOk.classList.add("active")
        showProductsForStatus("OK")
        $productsSearchInput.value = ""
    }
    if (e.target.classList.contains("header-storage")) {
        clearClassBtnByStatus()
        $headerStorage.classList.add("active")
        showProductsForStatus("STORAGE")
        $productsSearchInput.value = ""
    }
    if (e.target.classList.contains("header-out")) {
        clearClassBtnByStatus()
        $headerOut.classList.add("active")
        showProductsForStatus("OUT_OF_STOCK")
        $productsSearchInput.value = ""
    }
})