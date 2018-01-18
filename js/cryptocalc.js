/* 

Aplikace pro usnadnění výpočtů hodnot kryptoměn.
Aplikace načítá hodnoty kryptoměn z coinmarketcap API a hodnotu české koruny z Fixer API.

Funkce currency outputter vypočítá output ve zvolené měně (output currency) ze zadaných měn.

Funkce fiat inputter provede kalkulaci investice ze zadané hodnoty v korunách na kryptoměny podle zadaného podílu.

Funkce fractions vypočítá zlomky zvoleného množství Bitcoinu.

Autor: Jiří Čechal

*/

// API ktere pouzivame
const coinAPI = "https://www.coincap.io/front";
const fixerAPI = "https://api.fixer.io/latest?base=USD";

//pomocne promenne pro praci s hodnotami
var input_postfix = "_input";
var output_postfix = "_output";

// pocet kryptomen
var number_of_cryptos = 20;

// checked
var cryptos_checked = new Array(8);

// aktualni krypto
var currentCurrency = {
    short: "CZK",
    price: "0"
};

// pomocná pole pro práci s hodnotami a cenami
var values = new Array(number_of_cryptos);
var values_output = new Array(number_of_cryptos);
var values_input = new Array(number_of_cryptos);

// pole objektů kryptoměn
var cryptos_api = [];
var fiat_api = [];

// pole ze kterého se generuje inner HTML formů
var items_show = [],
    items_crypto_outputter = [],
    items_inputter_percent = [],
    items_inputter_output = [],
    crypto_output_pick = [],
    fiat_output_pick = [];

// načtení hodnoty fiat měn
fetch(fixerAPI)
    .then((resp) => resp.json())
    .then(function (data) {
        fiat_api = data.rates;
        currentCurrency.price = 1 / fiat_api.CZK;
    })
    .catch(function (error) {
        console.log(JSON.stringify(error));
    });


function initialize_pickers(number, list, element) {
    document.getElementById(element).innerHTML = "";
    for (let i = 0; i < number; i++) {
        let init_div = document.createElement("DIV");
        init_div.classList.add("currency-pick");

        let init_input = document.createElement("INPUT");
        init_input.type = "radio";
        init_input.value = ((element == "fiat-picker") ? list[i] : list[i].short);
        init_input.id = ((element == "fiat-picker") ? list[i] : list[i].short) + "_check";
        init_input.name = "selected";

        let init_label = document.createElement("LABEL");
        init_label.htmlFor = ((element == "fiat-picker") ? list[i] : list[i].short) + "_check";
        let init_span = document.createElement("SPAN");
        init_span.textContent = ((element == "fiat-picker") ? list[i] : list[i].short);

        init_label.appendChild(init_span);
        init_div.appendChild(init_input);
        init_div.appendChild(init_label);

        document.getElementById(element).appendChild(init_div);
    }
}


function initializeInputs(number, list, element) {
    document.getElementById(element).innerHTML = "";
    for (let i = 0; i < number; i++) {
            let init_div = document.createElement("DIV");
    init_div.classList.add("col-md-3", "col-sm-4", "col-xs-6");

    let init_label = document.createElement("LABEL");
    init_label.textContent = ((element == "items_inputter_percent") ? "%" : "") + list[i].short;

    let init_input = document.createElement("INPUT");
    init_input.id = list[i].short + ((element == "crypto-outputter") ? "" : ((element == "items_inputter_output") ? output_postfix : input_postfix));
    init_input.type = "text";
    init_input.readOnly = ((element == "items_inputter_output") ? true : false);

    init_div.appendChild(init_label);
    init_div.appendChild(init_input);

    document.getElementById(element).appendChild(init_div);
    }
}


function initializeList(number, list, element) {

    document.getElementById(element).innerHTML = "";

    for (let i = 0; i < number; i++) {

        if (i < cryptos_checked.length) {
            cryptos_checked[i] = cryptos_api[i];
        }

        let init_ul = document.createElement("UL");

        let init_li_name = document.createElement("LI");
        init_li_name.classList.add("label", "col-md-2", "col-xs-2");
        init_li_name.textContent = list[i].short

        let init_li_change = document.createElement("LI");
        init_li_change.classList.add("col-md-3", "col-xs-2");
        (list[i].cap24hrChange < 0) ? init_li_change.classList.add("red"): init_li_change.classList.add("green");
        init_li_change.textContent = parseFloat(list[i].cap24hrChange).toFixed(2);

        let init_li_mktcap = document.createElement("LI");
        init_li_mktcap.classList.add("col-md-3", "col-xs-2");
        init_li_mktcap.textContent = parseFloat(list[i].mktcap / 1000000).toFixed(2);

        let init_li_price = document.createElement("LI");
        init_li_price.classList.add("col-md-3", "col-xs-2");
        init_li_price.textContent = parseFloat(list[i].price).toFixed(2);

        let init_li_checkbox = document.createElement("LI");
        init_li_checkbox.classList.add("col-md-1", "col-xs-1", "no-border");

        let init_li_checkbox_input = document.createElement("INPUT")
        init_li_checkbox_input.type = "checkbox";
        (i < cryptos_checked.length) ? init_li_checkbox_input.checked = true: " ";
        init_li_checkbox_input.id = "C-" + list[i].short;
        init_li_checkbox_input.onchange = function () {
            console.log("onchange: " + list[i].short);
            reflow(list[i].short);
        }

        init_li_checkbox.appendChild(init_li_checkbox_input);
        init_ul.appendChild(init_li_name);
        init_ul.appendChild(init_li_change);
        init_ul.appendChild(init_li_mktcap);
        init_ul.appendChild(init_li_price);
        init_ul.appendChild(init_li_checkbox);

        document.getElementById(element).appendChild(init_ul);
    }
}


window.onload = function () {

    // načtení údajů o kryptoměnách
    fetch(coinAPI)
        .then((resp) => resp.json())
        .then(function (data) {
            cryptos_api = data;

            document.getElementById("prices").innerHTML = cryptos_api[0].long + " - <strong>" + (cryptos_api[0].price / currentCurrency.price).toFixed(4) + "</strong> " + currentCurrency.short;

            // inicializace levého panelu pro dynamické přídávání inputů
            initializeList(number_of_cryptos, cryptos_api, "items_show");

            // initialization of currency input fields
            initializeInputs(cryptos_checked.length, cryptos_api, "items_inputter_output");
            initializeInputs(cryptos_checked.length, cryptos_api, "items_inputter_percent");
            initializeInputs(cryptos_checked.length, cryptos_api, "crypto-outputter");

            // initialization of currency pickers
            initialize_pickers(number_of_cryptos, cryptos_api, "crypto-picker");
            initialize_pickers(Object.keys(fiat_api).length, Object.keys(fiat_api), "fiat-picker");

            document.getElementById("CZK_check").checked = true;

        })
        .catch(function (error) {
            console.log(JSON.stringify(error));
        });
}


function reflow(id) {
    var element = document.getElementById(id);
    var element_input = document.getElementById(id + input_postfix);
    var element_output = document.getElementById(id + output_postfix);

    if (!document.getElementById("C-" + id).checked) {
        element.parentNode.parentNode.removeChild(element.parentNode);
        element_input.parentNode.parentNode.removeChild(element_input.parentNode);
        element_output.parentNode.parentNode.removeChild(element_output.parentNode);
        cryptos_checked.splice(cryptos_checked.findIndex(i => i.short == id), 1);
        console.log("Jirka");
    } else {
        cryptos_checked.push(cryptos_api[cryptos_api.findIndex(i => i.short == id)]);
        console.log(id + " element: " +  document.getElementById(id) + element);
        initializeInputs(cryptos_checked.length, cryptos_checked, "items_inputter_percent");
        initializeInputs(cryptos_checked.length, cryptos_checked, "items_inputter_output");
        initializeInputs(cryptos_checked.length, cryptos_checked, "crypto-outputter");
        console.log(cryptos_checked);
    }
}


function getPrice() {
    let Price = 0;
    for (let i = 0; i < cryptos_checked.length; i++) {
        console.log("fiat inputter after get price");
        values[i] = document.getElementById(cryptos_checked[i].short).value;
        // invalid input check
        if (isNaN(document.getElementById(cryptos_checked[i].short).value)) {
            document.getElementById(cryptos_checked[i].short).style.border = "1px solid red";
            error_block.style.display = "block";
            break;
        } else {
            document.getElementById(cryptos_checked[i].short).style.border = "1px solid transparent";
            document.getElementById(cryptos_checked[i].short).style.borderBottom = "1px solid #555";
            error_block.style.display = "none";
        }
    }

    for (let i = 0; i < cryptos_checked.length; i++) {
        Price = Price + (Number(values[i]) * cryptos_checked[i].price);
    }
    return Price;
}


// vyčístí formulář
function clearForm(form) {
    for (let i = 0; i < cryptos_checked.length; i++) {
        document.getElementById(cryptos_checked[i].short + form).innerHTML = "";
    }
}


// rekalkulace % fiat vstupu
function recalc() {
    let procentaActual = 0;
    let total_price_budget = document.getElementById("total_price_budget");
    let error_block = document.getElementById("error_block");

    for (let i = 0; i < cryptos_checked.length; i++) {

        console.log("cryptos checked length je " + cryptos_checked.length + " jsme uvnitr recalc funkce, zrovna volam get element by id " + cryptos_checked[i].short + input_postfix);

        // show error
        if (isNaN(document.getElementById(cryptos_checked[i].short + input_postfix).value)) {
            console.log("nastala chyba");
            document.getElementById(cryptos_checked[i].short + input_postfix).style.border = "1px solid red";
            error_block.style.display = "block";
            break;
        } else {
            console.log("nenastala chyba radek 1");
            document.getElementById(cryptos_checked[i].short + input_postfix).style.border = "1px solid transparent";
            console.log("nenastala chyba radek 2");
            document.getElementById(cryptos_checked[i].short + input_postfix).style.borderBottom = "1px solid #555";
            error_block.style.display = "none";
        }
        procentaActual = Number(procentaActual) + Number(document.getElementById(cryptos_checked[i].short + input_postfix).value);
    }

    // zobrazit vysledek (zda % odpovidaji)
    clearForm(input_postfix);

    if (procentaActual < 100) {
        total_price_budget.innerHTML = (100 - procentaActual) + '% to go';
    } else {
        if (procentaActual > 100) {
            total_price_budget.innerHTML = procentaActual + '% thats too much';
            total_price_budget.style.backgroundColor = "red";
        } else {
            total_price_budget.style.backgroundColor = "transparent";
            total_price_budget.innerHTML = 'Allright';
            
            // vypočítat jednotlivé hodnoty
            fiatInputterBudget();
        }
    }
}


// změna aktuálně vybrané měny
function changeCurrentCurrency() {
    var radios = document.getElementsByName('selected');

    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            currentCurrency.short = radios[i].value;
            break;
        }
    }

    for (let i = 0; i < number_of_cryptos; i++) {
        if (currentCurrency.short == cryptos_api[i].short) {
            currentCurrency.price = cryptos_api[i].price;
        }
    }

    for (let i = 0; i < Object.keys(fiat_api).length; i++) {
        if (currentCurrency.short == Object.keys(fiat_api)[i]) {
            currentCurrency.price = 1 / Object.values(fiat_api)[i];
        }
    }

    document.getElementById("input_currency_header").innerHTML = "Input " + currentCurrency.short;
    document.getElementById("input_currency_label").innerHTML = currentCurrency.short;
    document.getElementById("total_price").innerHTML = "Output in " + currentCurrency.short;
    document.getElementById("prices").innerHTML = cryptos_api[0].long + " - <strong>" + (cryptos_api[0].price / currentCurrency.price).toFixed(1) + "</strong> " + currentCurrency.short;

    recalc();
    fiatInputter();

}


// vypocitat crypto output funkce fiat inputter
function fiatInputterBudget() {
    let input_currency = document.getElementById("input_currency");
    let values_output = new Array(number_of_cryptos);
    let values_percent = new Array(number_of_cryptos);
    let prices_calculated = new Array(number_of_cryptos);
    let input_to_usd = input_currency.value * currentCurrency.price

    for (let i = 0; i < number_of_cryptos; i++) {
        values_percent[i] = (document.getElementById(cryptos_checked[i].short + input_postfix).value / 100);

        prices_calculated[i] = (values_percent[i]);

        values_output[i] = prices_calculated[i] / (cryptos_checked[i].price / input_to_usd);
        console.log("czk part: " + values_output[i]);

        if (values_output[i] != 0) {
            document.getElementById(cryptos_checked[i].short + output_postfix).value = values_output[i].toFixed(8);
        }
    }
}


//vypočítá output crypto inputu
function fiatInputter() {
    console.log("fiat inputter before get price");
    let Price = getPrice();
    console.log("fiat inputter after get price");
    let total_price = document.getElementById('total_price');

    if (currentCurrency.short == null) {
        for (let i = 0; i < cryptos_checked.length; i++) {
            if (cryptos_checked[i] != null) {
                document.getElementById(cryptos_checked[i].short + "_check").checked = true;
                currentCurrency.short = cryptos_checked[i].short;
            }
        }
    }

    //zobrazit výsledek
    total_price.innerHTML = "total " + (Price / currentCurrency.price).toFixed(4) + " in " + currentCurrency.short;
}


// kalkulace zlomků kryptoměny
function calcBtc(who) {
    var cbtc = document.getElementById('btcCalc');
    var mbtc = document.getElementById('mbtcCalc');
    var ubtc = document.getElementById('ubtcCalc');
    var satoshi = document.getElementById('satoshiCalc');
    var usd = document.getElementById('usdCalc');

    switch (who) {
        case 1:
            mbtc.value = cbtc.value * 1000;
            ubtc.value = cbtc.value * 1000000;
            satoshi.value = cbtc.value * 100000000;
            usd.value = cbtc.value * cryptos_api[0].price;
            break;
        case 2:
            cbtc.value = mbtc.value * 0.001;
            ubtc.value = mbtc.value * 1000;
            satoshi.value = mbtc.value * 100000;
            usd.value = (mbtc.value * cryptos_api[0].price) / 1000;
            break;
        case 3:
            cbtc.value = ubtc.value * 0.000001;
            mbtc.value = ubtc.value * 0.001;
            satoshi.value = ubtc.value * 100;
            usd.value = (ubtc.value * cryptos_api[0].price) / 1000000;
            break;
        case 4:
            cbtc.value = satoshi.value * 0.00000001;
            mbtc.value = satoshi.value * 0.00001;
            ubtc.value = satoshi.value * 0.01;
            usd.value = (satoshi.value * cryptos_api[0].price) / 100000000;
            break;
        case 5:
            cbtc.value = usd.value / cryptos_api[0].price;
            mbtc.value = (usd.value / cryptos_api[0].price) * 1000;
            ubtc.value = (usd.value / cryptos_api[0].price) * 1000000;
            satoshi.value = (usd.value / cryptos_api[0].price) * 100000000;
            break;
    }
}