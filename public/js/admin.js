async function loadCadastros(){
  document.getElementById("modalEditarCadastro").style.display = "none"
  document.getElementById("ocorrencias").style.display = "none"
  document.getElementById("tableCadastros").style.display = "table"

  document.getElementById("pessoas").innerHTML = "Carregando..."
  
  const response = await fetch(`${link}/pessoas`) 
  const dados = await response.json()

  document.getElementById("pessoas").innerHTML = ""

  dados.forEach((d, i) => { 
    const tr = document.createElement("tr")

    tr.innerHTML = `
    <td>${d.nome}</td>
    <td>${d.telefone}</td>
    <td>${d.email}</td>
    <td>
    <img src="../img/icons/editar.svg" alt="editar" onclick="abrirEditarCadastro(${d.id})">
    <img src="../img/icons/deletar.svg" alt="deletar" onclick="deletarCadastro(${d.id})">
    </td>
    `

    document.getElementById("pessoas").appendChild(tr)
  });
}

async function abrirEditarCadastro(id){
  const response = await fetch(`${link}/pessoas/${id}`)
  const dados = await response.json() 

  if(dados == {}) {
    console.log("Erro ao carregar informações")
  }

  document.getElementById("edit_nome").value = dados.nome
  document.getElementById("edit_email").value = dados.email
  document.getElementById("edit_telefone").value = dados.telefone
  document.getElementById("edit_senha_antiga").value = dados.senha


  document.getElementById("editarCadastro").setAttribute("data-id", id)
  document.getElementById("modalEditarCadastro").style.display = "block"
}

document.getElementById("editarCadastro").addEventListener("submit", async(e) =>{
  e.preventDefault()

  const nome = document.getElementById("edit_nome").value
  const email = document.getElementById("edit_email").value
  const telefone = document.getElementById("edit_telefone").value
  const senha = document.getElementById("edit_senha_antiga").value

  const mudarSenha = document.getElementById("checkboxMudarSenha").checked

  const novaSenha = document.getElementById("edit_nova_senha").value
  const confNovaSenha = document.getElementById("edit_confirmar_nova_senha").value

  if(!nome || !email || !telefone || !senha) return
  if(mudarSenha == true && (!novaSenha || !confNovaSenha)) return
  if(confNovaSenha !== novaSenha){
    alert("Senhas incompatíveis")
    return
  }

  
  const id = document.getElementById("editarCadastro").getAttribute("data-id")

  const response = await fetch(`${link}/pessoas/${id}`, {
    method: "PUT",
    headers: {"Content-type":"application/json"},
    body: JSON.stringify({nome, email, telefone, senha: (mudarSenha ? novaSenha : senha)})
  })

  alert("Edição feita com sucesso")
  loadCadastros()
})

document.getElementById('checkboxMudarSenha').addEventListener("change", () =>{
  if(document.getElementById('checkboxMudarSenha').checked == true){
    document.getElementById("mudarSenha").style.display = "flex"
  } else{
    document.getElementById("mudarSenha").style.display = "none"
  }
})

function deletarCadastro(id){
  try {
    fetch(`${link}/pessoas/${id}`, {method: "DELETE"})

    alert("Cadastro deletado com sucesso!")
    loadCadastros()
  } catch (error) {
    
  }
}

async function loadOcorrencias(){
  document.getElementById("modalEditarCadastro").style.display = "none"
  document.getElementById("tableCadastros").style.display = "none"
  document.getElementById("ocorrencias").style.display = "block"
  
  document.getElementById("ocorrencias").innerHTML = "Carregando..."

  const response = await fetch(`${link}/ocorrencias`) 
  const dados = await response.json()

  document.getElementById("ocorrencias").innerHTML = ""

  dados.forEach((d, i) => { 
    const div = document.createElement("div")
    div.classList.add("box-ocorrencia")
    div.innerHTML = `
        <p>Nome do denunciante: ${d.denunciante}</p>
        <p>Nome do acusado: ${d.acusado}</p>
        <p><span>Data: ${formatarData(d.data)}</span> - <span>Local: ${d.local}</span></p>
        <p>Descrição: <i>${(d.descricao || "Não há descrição")}</i></p>
     
        <div style="width:100%;">
          <button class='botao-azul' onclick='loadLista(${i}, "ocTestemunhas")'>Testemunhas</button>
          <button class='botao-azul' onclick='loadLista(${i}, "ocEvidencias")'>Evidências</button>
        <div>
    `
    
    const testemunhas = document.createElement("div")
    testemunhas.classList.add("oc-testemunhas")

    d.testemunhas.forEach((t, i) =>{
      testemunhas.innerHTML += `
      <p>${i+1}. ${t[0]} - ${t[1]}<p>
      `
    })

    const evidencias = document.createElement("div")
    evidencias.classList.add("oc-evidencias")

    d.evidencias.forEach((t, i) =>{
      const extensao = verificarTipoArquivo(t)

      try {

        switch (extensao) {
          case "imagem":
            evidencias.innerHTML += `<img onclick='midiaFocus(this)' onerror='carregarErro(this)' style='height:100px' src='../uploads/${t}' alt='imagem'>`
            break;

          case "audio":
            evidencias.innerHTML += `<audio onclick='midiaFocus(this)' onerror='carregarErro(this)' controls style='height:100px' src='../uploads/${t}' alt='audio'></audio>`
            break;

          case "video":
            evidencias.innerHTML += `<video onclick='midiaFocus(this)' onerror='carregarErro(this)' controls style='height:100px' src='../uploads/${t}' alt='video'></video>`
            break;

          default:
            break;
        }        
      } catch (error) {
        evidencias.innerHTML += "<p>Arquivo não encontrado</p>"
      }


    })

    div.appendChild(testemunhas)
    div.appendChild(evidencias)

    document.getElementById("ocorrencias").appendChild(div)

  });
}

function loadLista(index, secao){
  const ocTestemunhas = document.getElementsByClassName("oc-testemunhas")

  for(let i = 0; i < ocTestemunhas.length; i++){
    ocTestemunhas[i].style.display = "none"

    if(i == index && secao == "ocTestemunhas" ){
      ocTestemunhas[i].style.display = "block"
    }
  }

  const ocEvidencias = document.getElementsByClassName("oc-evidencias")

  for(let i = 0; i < ocEvidencias.length; i++){
    ocEvidencias[i].style.display = "none"

    if(i == index && secao == "ocEvidencias" ){
      ocEvidencias[i].style.display = "block"
    }
  }
}

function midiaFocus(e){
  const oldElement = document.getElementsByClassName("midia-foco")

  for(let i = 0; i< oldElement.length; i++){
    oldElement[i].classList.remove("midia-foco")
  }

  e.classList.add("midia-foco")
}

function carregarErro(e){
  const element = document.createElement("p")
  element.innerText = "Arquivo não encontrado"
  
  e.replaceWith(element)  
}

function formatarData(isoString) {
  const data = new Date(isoString);
  
  // Pega os componentes da data
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // Meses começam do zero
  const ano = data.getFullYear();
  
  // Pega os componentes da hora
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  const segundos = String(data.getSeconds()).padStart(2, '0');
  
  // Retorna a data no formato dd/mm/yyyy hh:mm:ss
  return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
}

function verificarTipoArquivo(nomeArquivo) {
  // Converte o nome para minúsculas para evitar problemas com letras maiúsculas
  const nome = nomeArquivo.toLowerCase();

  // Extensões conhecidas
  const imagens = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const videos  = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
  const audios  = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];

  // Função auxiliar para verificar se o nome termina com alguma das extensões
  const temExtensao = (extensoes) => extensoes.some(ext => nome.endsWith(ext));

  if (temExtensao(imagens)) {
    return 'imagem';
  } else if (temExtensao(videos)) {
    return 'video';
  } else if (temExtensao(audios)) {
    return 'audio';
  } else {
    return 'desconhecido';
  }
}