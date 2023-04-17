function guardarProducto() {

    const codigo = document.getElementById("codigo").value;
    const descripcion = document.getElementById("descripcion").value;
    const importe = document.getElementById("importe").value;
    const stock = document.getElementById("stock").value;

// valida que se hayan ingresado los campos obligatorios
    if (!codigo || !descripcion || !importe || !stock) {
        alert("Por favor, complete todos los campos");
        return;
    }

// crea un objeto con los datos del producto
    const producto = {
        codigo,
        descripcion,
        importe,
        stock
    };

// agrega el producto a la lista de productos
    const listaProductos = JSON.parse(localStorage.getItem("productos")) || [];
    listaProductos.push(producto);
    localStorage.setItem("productos", JSON.stringify(listaProductos));

// limpia los campos del formulario
    document.getElementById("codigo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("importe").value = "";
    document.getElementById("stock").value = "";
}

const buscador = document.getElementById("buscador")
buscador.addEventListener("input", buscarProducto)

function cargarProductos() {
    return new Promise((resolve) => {
        const listaProductos = JSON.parse(localStorage.getItem("productos")) || [];
        resolve(listaProductos);
    });
}

function buscarProducto() {
    const campoBusqueda = document.getElementById("campo-busqueda").value;
    const valorBusqueda = document.getElementById("buscador").value;

    cargarProductos()
        .then(productos => {
            if(valorBusqueda.length > 0){
                const resultados = productos.filter(producto => {
                    const valor = producto[campoBusqueda];
                    return valor.toLowerCase().startsWith(valorBusqueda.toLowerCase());
                });
                actualizarTablaProductos(resultados);
            } else {
                actualizarTablaProductos([])
            }
        })
        .catch(error => {
            console.error("Error al cargar los productos:", error);
        });
}

function actualizarTablaProductos(productos) {
    const tablaResultados = document.getElementById("resultados-busqueda");
    console.log(tablaResultados)
    tablaResultados.innerHTML = ""; // limpia la tabla antes de actualizarla

    productos.forEach(producto => {
        let fila = document.createElement("tr");

        const codigo = document.createElement("td");
        codigo.textContent = producto.codigo;
        fila.appendChild(codigo);

        const descripcion = document.createElement("td");
        descripcion.textContent = producto.descripcion;
        fila.appendChild(descripcion);

        const importe = document.createElement("td");
        importe.textContent = producto.importe;
        fila.appendChild(importe);

        const stock = document.createElement("td");
        stock.textContent = producto.stock;
        fila.appendChild(stock);

        const cantidad = document.createElement("input");
        cantidad.setAttribute("type", "number");
        cantidad.id = "cantidad"
        fila.appendChild(cantidad);

        const anadir = document.createElement("button");
        anadir.textContent = "Añadir al Carro"
        anadir.addEventListener("click", function(){anadirCarrito(parseInt(cantidad.value), producto)})
        fila.appendChild(anadir)

        tablaResultados.appendChild(fila);
    });
}

function anadirCarrito(cantidad, producto) {
    if(!Number.isInteger(cantidad)) {
        alert("Debe introducir la cantidad númerica");
    } else if(cantidad > producto.stock && producto.stock!==0) {
        let noStock = "No tenemos la cantidad de existencias que demanda.\nQuiza le interesen estos productos:\n";
        let recomendaciones = recomendacion(producto.descripcion);
        recomendaciones.forEach(recomendacion => {
            noStock += "- "+ recomendacion.descripcion + "\n";
        });
        console.log(noStock);
        alert(noStock);
    } else if(cantidad <= 0){
        alert("Valor introducido incorrecto");
    }else {
        const carrito = document.getElementById("productos-carrito");
        console.log(carrito)

        let carro=JSON.parse(localStorage.getItem("carro"))||[];  // Array carroo!!!

        let fila = document.createElement("tr");

        const codigo = document.createElement("td");
        codigo.textContent = producto.codigo;
        codigo.setAttribute("id", producto.codigo)
        fila.appendChild(codigo);

        const descripcion = document.createElement("td");
        descripcion.textContent = producto.descripcion;
        descripcion.setAttribute("id", producto.descripcion)
        fila.appendChild(descripcion);

        const importe = document.createElement("td");
        importe.textContent = producto.importe;
        fila.appendChild(importe);

        const nProductos = document.createElement("td");
        producto.stock -= cantidad;
        nProductos.textContent = cantidad;
        fila.appendChild(nProductos);

        const pUnitario = document.createElement("td");
        pUnitario.textContent = (cantidad*producto.importe).toString();
        fila.appendChild(pUnitario);

        const quitar = document.createElement("button");
        quitar.textContent = "Quitar"
        quitar.addEventListener("click", function(){quitarProducto(fila,producto, cantidad)});
        fila.appendChild(quitar);

        carro.push(actualizarCarro(producto,cantidad));
        localStorage.setItem("carro",JSON.stringify(carro));
        carrito.appendChild(fila);
    }
}

function  actualizarCarro(producto,cantidad) {

    let productoCarro={
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        pUnitario: producto.importe,
        cantidad: cantidad,
        importe: producto.importe*cantidad


    };

}

function recomendacion(producto) {
    let productos = JSON.parse(localStorage.getItem("productos"))
    let letra = producto.charAt[0]
    return productos.filter(recomendacion => recomendacion.descripcion.startsWith(letra) && recomendacion.descripcion !== producto);
}

function quitarProducto(fila,producto,cantidad) {
    producto.stock += cantidad;
    fila.outerHTML="";
}

function pagarBoton() {
    const montoAPagar = obtenerMontoAPagar();
    const stockActual = obtenerStockActual();

    if (montoAPagar > 0 && stockActual > 0) {

        const pasarelaPago = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });

        // Actualizar el stock en el localstorage
        const actualizarStock = new Promise((resolve) => {
            // Obtenemos el stock actual y lo actualizamos restando la cantidad de productos que se vendieron
            const stockActual = obtenerStockActual();
            const cantidadAVender = obtenerCantidadAVender();
            const nuevoStock = stockActual - cantidadAVender;
            localStorage.setItem("stock", nuevoStock);
            resolve();
        });

        // Esperar a que ambas acciones hayan finalizado para actualizar el status de la transacción
        Promise.all([pasarelaPago, actualizarStock]).then(() => {
            actualizarStatusTransaccion("completada");
        })
            .catch(razon=>{
                if(razon==="s"){
                    alert("No se ha podido realizar la transacción")
                }
            });
    }
}
function actualizarStatusTransaccion(item, quantity){

    return new Promise((resolve) => {
        try {
            const currentStock = JSON.parse(localStorage.getItem('productos'));
            const carro  = JSON.parse(localStorage.getItem('carro'));
            currentStock.map(producto=>{
                carro.forEach(carro=>{
                    if(producto.descripcion==carro.descripcion){
                        producto.stock -= carro.cantidad
                    }});
            });
            localStorage.setItem('productos', JSON.stringify(currentStock));

            resolve();
        } catch (error) {
            console.log("Error")
        }

    });
}

// Agrega esta función en tu código para llamarla al hacer clic en el botón de pago
function processPayment() {
    // ... código para procesar el pago ...

    // Luego, actualiza el stock en localStorage utilizando la promesa
    const itemsToPurchase = getItemsToPurchaseFromCart(); // función para obtener los elementos del carrito
    itemsToPurchase.forEach((item) => {
        updateStockInLocalStorage(item.id, item.quantity)
            .then(() => console.log(`Stock actualizado para ${item.name}`))
            .catch((error) => console.error(error));
    });

    // ... más código para finalizar el proceso de pago ...
}
