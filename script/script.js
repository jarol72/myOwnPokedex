const d = document,
  API_BASE_URL = 'https://pokeapi.co/api/v2/',
  $searchInput = d.querySelector('.searchBar__input'),
  $mainImage = d.querySelector(".main-image"),
  $pokemonName = d.querySelector('.pokemonName'),
  $types = d.querySelector('.types'),
  $hp = d.getElementById('hp'),
  $attack = d.getElementById('attack'),
  $defense = d.getElementById('defense'),
  $spAttack = d.getElementById('sp-attack'),
  $spDefense = d.getElementById('sp-defense'),
  $speed = d.getElementById('speed'),
  $desc = d.querySelector('.description'),
  $other = d.querySelector('.other__list');

let $fragment = d.createDocumentFragment(),
  currentPokemonId = 1,
  currentPokemonData,
  currentPokemonImage = 0,
  imagesURL,
  searchString;


const fetchData = async (api) => {
  try {
    const data = await fetch(api);
    currentPokemonData = await data.json();

    return currentPokemonData;
  } catch (error) {
    alert(`Sorry, I can't find that Pokémon.\nAre you sure It exists?`);
  }
}

const showPokemon = async () => {
  const currentPokemonData = await fetchData(`${API_BASE_URL}pokemon/${currentPokemonId}`);

  currentPokemonId = currentPokemonData.id;
  console.log('current', currentPokemonData);

  imagesURL = getSprites();
  $mainImage.src = imagesURL[currentPokemonImage];
  $pokemonName.textContent = currentPokemonData.name;

  $types.innerHTML = '';
  currentPokemonData.types.forEach(type => {
    const $type = d.createElement('span');
    let typeName = type.type.name
    $type.classList.add(`type`);
    $type.classList.add(typeName);
    $type.textContent = typeName;
    $fragment.append($type);
  })
  $types.append($fragment);
  $fragment.innerHTML = '';

  showStats();
  showDesc();
  showOther();
}

const getSprites = () => {
  const sp = Object.values(currentPokemonData.sprites.other);
  const sprites = sp.map(sp => sp.front_default);

  return sprites;
}

const showStats = () => {
  const orderedStats = currentPokemonData.stats.sort((a, b) => a.base_stat - b.base_stat);

  let max = orderedStats[orderedStats.length - 1].base_stat;

  [$hp, $attack, $defense, $spAttack, $spDefense, $speed].map(
    (node, index) => {
      let value = currentPokemonData.stats[index].base_stat;
      let normValue = value / max;

      node.style.width = `${normValue * 100}%`;
      node.textContent = currentPokemonData.stats[index].base_stat;
    }
  );
};

const showDesc = async () => {
  const specie = currentPokemonData.species.name;
  const specieData = await fetchData(`${API_BASE_URL}pokemon-species/${specie}`);
  let desc = specieData.flavor_text_entries[6].flavor_text;
  desc = desc.replace('\f', '  ');
  $desc.textContent = desc;
}

const showOther = async () => {
  $other.innerHTML = '';
  const other = await fetchData(`${API_BASE_URL}pokemon/?limit=12&offset=${currentPokemonId}`);
  pokemons = other.results;

  pokemons.forEach(pk => {
    const $pkCard = d.createElement('li');
    const $pkCardImg = d.createElement('img');
    const $pkCardName = d.createElement('p');

    const pokemon = fetchData(pk.url).then(details => {
      const pkDetail = details;

      $pkCard.classList.add('pkcard');
      $pkCard.classList.add(pkDetail.types[0].type.name);
      $pkCard.setAttribute('id', pkDetail.id);
      $pkCardImg.src = `${pkDetail.sprites.other.dream_world.front_default}`;
      $pkCardImg.classList.add('pkcard-img');
      $pkCardImg.alt = `Image of ${pkDetail.name}`;
      $pkCardName.classList.add('pkcard-name');
      $pkCardName.textContent = pkDetail.name
    });

    $pkCard.appendChild($pkCardImg);
    $pkCard.appendChild($pkCardName);
    $fragment.appendChild($pkCard);
  });
  $other.appendChild($fragment);
}

const simulateClick = () => {
  const searchIcon = d.querySelector('.searchBar__btn');

  let evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });

  searchIcon.dispatchEvent(evt);
}

d.addEventListener('click', e => {
  if (e.target.matches('.btn--next')) {
    currentPokemonId = (currentPokemonId + 1) ? currentPokemonId + 1 : 1;
    currentPokemonImage = 0;
    showPokemon();
  }

  if (e.target.matches('.btn--previous')) {
    currentPokemonId = currentPokemonId > 1 ? currentPokemonId - 1 : 1;
    currentPokemonImage = 0;
    showPokemon();
  }

  if (e.target.matches('.arrow-left')) {
    currentPokemonImage = currentPokemonImage === 0
      ? imagesURL.length - 1
      : currentPokemonImage - 1;

    $mainImage.src = imagesURL[currentPokemonImage];
  }

  if (e.target.matches('.arrow-right')) {
    currentPokemonImage = currentPokemonImage === imagesURL.length - 1
      ? 0
      : currentPokemonImage + 1;
    $mainImage.src = imagesURL[currentPokemonImage];
  }

  if (e.target.matches('.pkcard')
    || e.target.matches('.pkcard-img')
    || e.target.matches('.pkcard-name')) {
    if (e.target.id) {
      currentPokemonId = e.target.id;
    } else {
      currentPokemonId = e.target.parentElement.id;
    }
    scroll(0, 0)
    showPokemon();
  }

  if (e.target.matches('.searchBar__btn') || e.target.matches('.searchBar__icon')) {
    currentPokemonId = searchString;
    $searchInput.value = '';
    showPokemon();
  }
});

d.addEventListener('keyup', e => {
  console.log(e);
  if (e.target.matches('.searchBar__input')) {
    searchString = e.target.value.toLowerCase();
    if(e.keyCode === 13) {
      console.log('Presionaste Enter')
      if(e.target.value !== '') {
        simulateClick();
      } else {
        alert(`Sorry, I can't find a Pokémon if you don't give a name or number to search for...`);
      }
    }
  }
})

showPokemon();