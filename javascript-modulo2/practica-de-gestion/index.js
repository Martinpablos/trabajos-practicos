//1.nombre y cuanto dinero puede ahorrar

let nombre= prompt("¿cual es tu nombre?");
    alert("hola "+nombre+" bienvenido a tu nuevo gym, la cuota mensual es de $5000");

let ahorro= Number(prompt("¿cuanto dinero podes ahorrar por dia?"));

let ahorrototal=0;

//2.simular el paso durante 7 dias
//3. por cada dia debe sumarse el ahorro a una variable
for (let i=1; i<=7;i++)
    { ahorrototal=ahorrototal+ahorro;
};

//4.alert sobre cuanto ahorro en total y ademas te diga:¡ya tenes para pagar el mes! o ¡segui esforzandote!

    if (ahorrototal>=5000){
            alert("¡bien!, ya podes pagar el mes!")}
    else {
            alert("¡sigue esforzandote!, llevas ahorrado "+ ahorrototal +" pesos")};