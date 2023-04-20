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
//Funcionalidades del carrtio
function anadirCarrito(cantidad, producto) {
    let carro=JSON.parse(localStorage.getItem("carro"))||[];  // Array carroo!!!

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
        quitar.addEventListener("click", function(){quitarProducto(fila,producto)});
        fila.appendChild(quitar);

        carro.push(actualizarCarro(producto,cantidad));
        localStorage.setItem("carro",JSON.stringify(carro));
        carrito.appendChild(fila);
    }

    actualizarPrecio(carro);
}

function  actualizarCarro(producto,cantidad) {
    return {
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        pUnitario: producto.importe,
        cantidad: cantidad,
        importe: producto.importe*cantidad
    };
}

function recomendacion(producto) {
   let productos= JSON.parse(localStorage.getItem("productos"));
    let letra = producto[0];
    return productos.filter(recomendacion => recomendacion.descripcion.startsWith(letra) && recomendacion.descripcion !== producto && parseInt(recomendacion.stock)!==0);
}

function quitarProducto(fila,producto) {
    let carro = JSON.parse(localStorage.getItem("carro"));
    let index = carro.findIndex(articulo => articulo.descripcion === producto.descripcion);
    carro.splice(index,1);
    fila.outerHTML="";
    actualizarPrecio(carro);
    localStorage.setItem("carro", JSON.stringify(carro));
}

function limpiarCarro() {
    document.getElementById("productos-carrito").innerHTML = "";
    localStorage.setItem("carro", JSON.stringify([]));

    let total = document.getElementById("total");
    total.textContent = "0.00€";
}

function actualizarPrecio(carro) {
    let total = document.getElementById("total");
    if(carro.length > 0){
        total.textContent = carro.reduce((total,producto) => total + producto.importe,0).toFixed(2)+"€";
    } else {
        total.textContent = "0.00€";
    }
}

//Pago y reduccion de stock
function botonPagar() {
    const pasarelaPago = new Promise((resolve,reject) => {
        setTimeout(() => {
            const random = Math.round(Math.random() * 100);
            if(random >= 31){
                resolve(0);
            } else {
                reject(1);
            }
        }, 3000);
    });

    // Actualizar el stock en el localstorage
    const actualizarStock = new Promise((resolve,reject) => {
        setTimeout(() => {
            const random = Math.round(Math.random() * 100)
           if(random >= 21) {
               var productos = JSON.parse(localStorage.getItem("productos"));
               const carro = JSON.parse(localStorage.getItem("carro"));

               carro.forEach(articulo => {
                   let index = productos.findIndex(producto => producto.descripcion === articulo.descripcion);
                   productos[index].stock -= articulo.stock;
               })

               localStorage.setItem("productos", JSON.stringify(productos));
               resolve(0);
           } else {
               reject(2);
           }
        }, 2000);

    });

    // Esperar a que ambas acciones hayan finalizado para actualizar el status de la transacción
    Promise.all([pasarelaPago, actualizarStock]).then(() => {
        actualizarStatusTransaccion("La transaccion fue realizada correctamente");
    })
        .catch(razon=>{
            if(razon===1) {
                alert("No se ha podido realizar la transacción")
            }else if(razon===2) {
                var productos = JSON.parse(localStorage.getItem("productos"));
                const carro = JSON.parse(localStorage.getItem("carro"));
                carro.forEach(articulo => {
                    let index = productos.findIndex(producto => producto.descripcion === articulo.descripcion);
                    productos[index].stock += articulo.stock;
                })
                alert("No hay existencias suficientes para uno de los productos seleccionados")
            }
        }
    );
}

