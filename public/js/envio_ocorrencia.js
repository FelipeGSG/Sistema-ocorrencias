let testemunhas = []
let evidencias = []
let filesFromOcorrencia = undefined

/*
Evidências
Chitãozinho & Xororó

Quando eu digo que deixei de te amar
É porque eu te amo
Quando eu digo que não quero mais você
É porque eu te quero
Eu tenho medo de te dar meu coração
E confessar que eu estou em tuas mãos
Mas não posso imaginar
O que vai ser de mim
Se eu te perder um dia

Eu me afasto e me defendo de você
Mas depois me entrego
Faço tipo, falo coisas que eu não sou
Mas depois eu nego
Mas a verdade
É que eu sou louco por você
E tenho medo de pensar em te perder
Eu preciso aceitar que não dá mais
Pra separar as nossas vidas

E nessa loucura de dizer que não te quero
Vou negando as aparências
Disfarçando as evidências
Mas pra que viver fingindo
Se eu não posso enganar meu coração?
Eu sei que te amo!

Chega de mentiras
De negar o meu desejo
Eu te quero mais que tudo
Eu preciso do seu beijo
Eu entrego a minha vida
Pra você fazer o que quiser de mim
Só quero ouvir você dizer que sim!

Diz que é verdade, que tem saudade
Que ainda você pensa muito em mim
Diz que é verdade, que tem saudade
Que ainda você quer viver pra mim
*/

document.addEventListener("DOMContentLoaded", () =>{
  const id = sessionStorage.getItem("user") 

  if(id == "" || id == undefined || id == null){
    window.location.href = "index.html"
  }
  
  fetch(`${link}/pessoas`)
  .then(res => res.json())
  .then(dados =>{
    const user = dados.find(d => d.id == id)

    if(!user){
      window.location.href = "index.html"
    } else{
      document.body.style.display = "block"
    }
  })
})

async function enviarOcorrencia(){
  const denunciante = document.getElementById("denunciante").value
  const acusado = document.getElementById("acusado").value
  const data = document.getElementById("data").value
  const local = document.getElementById("local").value
  const descricao = document.getElementById("descricao").value
  const info_adicional = document.getElementById("info_adicional").value

  if(!denunciante.trim() || !acusado.trim() || !data || !local.trim() || !descricao.trim()){
    alert("Complete todos os campos necessários")
    return
  }

  if(testemunhas.length === 0){
    alert("Necessário ao menos uma testemunha")
    return
  }

  await enviarEvidencias()
  // console.log(filesFromOcorrencia)

  const response = await fetch(`${link}/ocorrencias`, {
    method: "POST",
    headers: {"Content-type" : "application/json"},
    body: JSON.stringify({
      denunciante, acusado, data,
      local, descricao, testemunhas,
      evidencias: filesFromOcorrencia, 
      info_adicional: info_adicional || "Não há informações adicionais"
    })
  })

  if(response.status == 201){
    alert("Sucesso ao enviar ocorrência")
    evidencias = [];
    testemunhas = [];
    filesFromOcorrencia = undefined
    atualizarListaEvidencias();
    atualizarListaTestemunha();
    document.getElementById("ocorrencia").reset()
  }

}

function adicionarTestemunha(){
  const nome = document.getElementById("testemunha_nome").value
  const telefone = document.getElementById("testemunha_telefone").value

  if(!nome || !telefone){
    return
  }

  document.getElementById("testemunha_nome").value = ''
  document.getElementById("testemunha_telefone").value = ''

  testemunhas.push([nome, telefone])
  atualizarListaTestemunha()

}

function atualizarListaTestemunha(){
  const listaTestemunhas = document.getElementById("listaTestemunhas")
  listaTestemunhas.innerHTML = ""

  testemunhas.forEach((t, i) =>{
      const item = document.createElement("li")
      item.classList.add("item_testemunhas")

      const p1 = document.createElement("p")
      p1.innerText = t[0]

      const p2 = document.createElement("p")
      p2.innerText = t[1]
      p2.innerHTML += `<b onclick="deletarTestemunha(${i})">X</b>`

      item.appendChild(p1)
      item.appendChild(p2)

      listaTestemunhas.appendChild(item)
  })
}

function deletarTestemunha(i){
  testemunhas.splice(i, 1)
  atualizarListaTestemunha()
}

function adicionarEvidencia() {
  const input = document.getElementById("evidencia_arquivo");

  if (!input.files.length) return;


  // Adiciona cada arquivo selecionado ao array
  for (let file of input.files) {
    evidencias.push(file);
  }

  if(evidencias.length >= 5){
    document.querySelector(`button[onclick="adicionarEvidencia()"]`).disabled = true
    return
  };
  document.querySelector(`button[onclick="adicionarEvidencia()"]`).disabled = false


  // Atualiza lista visual
  atualizarListaEvidencias();

  // Limpa o input para poder selecionar outros arquivos
  input.value = "";

}

function atualizarListaEvidencias() {
  const lista = document.getElementById("listaEvidencias");
  lista.innerHTML = "";

  evidencias.forEach((file, index) => {
    const li = document.createElement("li");
    li.textContent = file.name;
    
    const del = document.createElement("b")
    del.textContent = "X"
    del.setAttribute(`onclick`, `deletarEvidencia(${index})`)
    
    li.appendChild(del)
    lista.appendChild(li);
  });

  document.getElementById("nEvidencias").textContent = evidencias.length
}

function deletarEvidencia(i){
  evidencias.splice(i, 1)
  atualizarListaEvidencias()
}

async function enviarEvidencias() {
  if (evidencias.length === 0) {
    alert("Nenhuma evidência adicionada!");
    return;
  }

  const formData = new FormData();
  evidencias.forEach(file => formData.append("evidencias", file));

  await fetch(`${link}/api/upload`, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(data => {

    data = JSON.parse(data)
    if(data.status === 200){
      filesFromOcorrencia = data.files
    } else{
      console.error("Erro: ", data)
    }

    // console.log("Resposta:", JSON.parse(data));



  })
  .catch(err => console.error("Erro ao enviar:", err));
}
