const form = document.getElementById('register-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const formData = new URLSearchParams(data).toString();
    try {
       
        const response = await fetch('api/sessions/register', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const responseData = await response.json();
        if (responseData.status === "success") {
            window.location.replace("/login");
        } else {
            console.error("Error al crear el usuario");
        }
    } catch (error) {
        console.error("Error al realizar la solicitud POST:", error);
    }
});
