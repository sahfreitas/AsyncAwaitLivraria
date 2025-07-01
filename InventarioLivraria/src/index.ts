import fs from "fs";
import inquirer from "inquirer";

interface Livro {
  titulo: string;
  autor: string;
  paginas: number;
  editora: "Arqueiro" | "Companhia das Letras" | "DarkSide Books" | "Intrínseca" | "Outra";
  isbn: number;
}

function salvarLivro(novoLivro: Livro): void {
  console.log("Verificando banco de dados...");

  const dbFile: string = `src/database/database.json`;

  let livrosDoBanco: Livro[] = [];

  try {
    const conteudoDoArquivo = fs.readFileSync(dbFile, "utf-8");
    livrosDoBanco = JSON.parse(conteudoDoArquivo);
  } catch (erro: any) {
    if (erro.code !== "ENOENT") {
      throw erro;
    }
  }

  const livroExistente = livrosDoBanco.find(
    (livro) => livro.isbn === novoLivro.isbn
  );

  if (livroExistente) {
    throw new Error(`O livro com o ISBN '${novoLivro.isbn}' já está cadastrado.`);
  }

  livrosDoBanco.push(novoLivro);
  const novoConteudo = JSON.stringify(livrosDoBanco, null, 2);
  fs.writeFileSync(dbFile, novoConteudo, "utf-8");

  console.log("✅ livro inserido com sucesso!");
}

async function run(): Promise<void> {
  try {
    console.log("Bem-vindo ao Inventário de Livros Interativo!");

    const perguntas = [
      {
        type: "input",
        name: "titulo",
        message: "Qual é o título do livro?",
        validate: (input: string): boolean | string => {
          if (input.trim() === "") {
            return "Por favor, digite um título.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "autor",
        message: "Qual é o autor do livro?",
        validate: (input: string): boolean | string => {
          if (input.trim() === "") {
            return "Por favor, digite um autor.";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "paginas",
        message: "Qual é o número de páginas do livro?",
        validate: (input: string): boolean | string => {
          if (input.trim() === "") {
            return "Por favor, digite um numero de paginas.";
          }
          return true;
        },
      },
      {
        type: "list",
        name: "editora",
        message: "Qual é a editora do livro?",
        choices: ["Arqueiro", "Companhia das Letras", "DarkSide Books", "Intrínseca", "Outra"],
      },
      {
        type: "input",
        name: "isbn",
        message: "Qual é o ISBN do livro?",
        validate: (input: string): boolean | string => {
          if (input.trim() === "") {
            return "Por favor, digite o ISBN do livro.";
          }
          if (isNaN(Number(input))) {
            return "O ISBN deve ser um número.";
          }
          return true;
        },
        filter: (input: string) => Number(input),
      },
    ] as const;

    const respostas = await inquirer.prompt<Livro>(perguntas as any);

    console.log("\n--- Livro Salvo ---");
    console.log(respostas);
    console.log("---------------------\n");

    salvarLivro(respostas);
  } catch (erro: unknown) {
    if (erro instanceof Error) {
      console.error(`❌ Erro: ${erro.message}`);
    } else {
      console.error("Ocorreu um erro desconhecido:", erro);
    }
  }
}

run();
