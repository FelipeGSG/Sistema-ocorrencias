async function envioCadastro(){
  const nome = document.getElementById("cadastro_nome").value
  const email = document.getElementById("cadastro_email").value
  const telefone = document.getElementById("cadastro_nome").value
  const senha = document.getElementById("cadastro_senha").value
  const confirmarSenha = document.getElementById("cadastro_confirmarSenha").value

  if(!nome || !email || !telefone || !senha || !confirmarSenha){
    alert("Necessário completar todos os campos")
    return
  }
  if(senha !== confirmarSenha){
    alert("Senhas incompatíveis")
    return
  }

  try {
    await fetch(`${link}/pessoas`)
    .then(res => res.json())
    .then(dados =>{
      const userExistente = dados.find(d => d.email == email)

      if(userExistente){
        alert("Esse email já está em uso!")
        throw new Error("Email existente")
      }
    })

    const envio = await fetch(`${link}/pessoas`, {
      method: "POST",
      headers: {"Content-type":"application/json"},
      body: JSON.stringify({nome, email, telefone, senha, role: 'user'})
    })

    if(envio.ok){
      alert("Cadastro realizado com sucesso!")
      toggleLogin(true)
    } 
  } catch (error) {
    return
  }
}

async function envioLogin() {

  document.getElementById("statusLogin").innerText = "Carregando."

  const nome = document.getElementById("login_nome").value
  const email = document.getElementById("login_email").value
  const senha = document.getElementById("login_senha").value
  const confirmarSenha = document.getElementById("login_confirmarSenha").value

  document.getElementById("login_nome").disabled = true
  document.getElementById("login_email").disabled = true
  document.getElementById("login_senha").disabled = true
  document.getElementById("login_confirmarSenha").disabled = true

  if(!nome || !email || !senha || !confirmarSenha){
    alert("Necessário completar todos os campos")     
    return
  }

  if(senha !== confirmarSenha){
    alert("Senhas não compatíveis")
    return
  }

  let countDots = 1
  let carregarPontos = setInterval(() =>{
    countDots++
    countDots = countDots % 3

    switch (countDots) {
      case 0:
        document.getElementById("statusLogin").innerText = "Carregando."
        break;
      case 1:
        document.getElementById("statusLogin").innerText = "Carregando.."
        break;
      case 2:
        document.getElementById("statusLogin").innerText = "Carregando..."
        break;
      default:
        break;
    }
    
  }, 1000)

  try {
      const response = await fetch(`${link}/pessoas`)
      if(!response.ok){
        alert("Erro procurar informações")
        console.error(response.status, response.statusText)
        return
      }
      const dados = await response.json()

      let userEncontrado = false

      dados.forEach(e => {
        if(
          ((nome == e.nome) || (email == e.email)) &&
          (senha === e.senha)
        ){
          userEncontrado = true
          sessionStorage.setItem("user", e.id)

          if(e.role === "admin"){
            window.location.href = "admin.html"
          } else{
            window.location.href = "envio_ocorrencia.html"
          }
        }
      });

      if(!userEncontrado){
        alert("Usuário não encontrado")
        document.getElementById("statusLogin").innerText = "Usuário não encontrado"

        document.getElementById("login_nome").disabled = false
        document.getElementById("login_email").disabled = false
        document.getElementById("login_senha").disabled = false
        document.getElementById("login_confirmarSenha").disabled = false

        clearInterval(carregarPontos)
      }
  } catch (error) {
    alert("Erro ao enviar login")
    window.location.reload()
    console.log(error)
  }

}

function toggleLogin(login = true){

  if(!login){
    document.getElementById("login").style.display = "none"
    document.getElementById("cadastro").style.display = "block"
  } else{
    document.getElementById("login").style.display = "block"
    document.getElementById("cadastro").style.display = "none"
  }
}