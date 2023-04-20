function guardarProducto() {

    const codigo = document.getElementById("codigo").value;
    const descripcion = document.getElementById("descripcion").value;
    const importe = document.getElementById("importe").value;
    const stock = document.getElementById("stock").value;

//  Valida que se hayan ingresado los campos obligatorios
    if (!codigo || !descripcion || !importe || !stock) {
        alert("Por favor, complete todos los campos");
        return;
    }

//  Crea un objeto con los datos del producto
    const producto = {
        codigo,
        descripcion,
        importe,
        stock
    };

//  Agrega el producto a la lista de productos
    const listaProductos = JSON.parse(localStorage.getItem("productos")) || [];
    listaProductos.push(producto);
    localStorage.setItem("productos", JSON.stringify(listaProductos));

//  Limpia los campos del formulario
    document.getElementById("codigo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("importe").value = "";
    document.getElementById("stock").value = "";
}

function limpiarProductos() {
    localStorage.setItem("productos",JSON.stringify([]));
}