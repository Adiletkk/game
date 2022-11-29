window.onload = function() {
    document.addEventListener('keydown', changeDirection);
    setInterval(loop, 1000/60); // 60 FPS
  }
  
  let
    canv 				= document.getElementById('mc'), // фон
    ctx					= canv.getContext('2d'), // 2d context
    gs = fkp			= false, // игра запущена && первая клавиша нажата (состояния инициализации)
    speed = baseSpeed 	= 3, //скорость передвижения змеи
    xv = yv				= 0, //   скрость x y 
    px 					= ~~(canv.width) / 2, // позиция x игрока
    py 					= ~~(canv.height) / 2, // позиция y игрока
    pw = ph				= 20, // размер игрока
    aw = ah				= 20, // размер яблока
    apples				= [], // список яблок
    trail				= [], // список хвостовых элементов (трейл)
    tail 				= 100, // размер хвоста (1 из 10)
    tailSafeZone		= 20, // защита от самосъедания для зоны головы (она же safeZone)
    cooldown			= false, // ключ в режиме перезарядки
    score				= 0; // текущий счет
  
  // основной цикл игры
  function loop()
  {
    // логика
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);
  
    // форсируем скорость
    px += xv;
    py += yv;
  
    // телепортирует
    if( px > canv.width )
      {px = 0;}
  
    if( px + pw < 0 )
      {px = canv.width;}
  
    if( py + ph < 0 )
      {py = canv.height;}
  
    if( py > canv.height )
      {py = 0;}
  
    // раскрашиваем саму змейку с элементами хвоста
    ctx.fillStyle = 'lime';
    for( let i = 0; i < trail.length; i++ )
    {
      ctx.fillStyle = trail[i].color || 'lime';
      ctx.fillRect(trail[i].x, trail[i].y, pw, ph);
    }
  
    trail.push({x: px, y: py, color: ctx.fillStyle});
  

// ограничитель

    if( trail.length > tail )
    {
      trail.shift();
    }
  
// съеден
    if( trail.length > tail )
    {
      trail.shift();
    }
  
    // собственные столкновения
    if( trail.length >= tail && gs )
    {
      for( let i = trail.length - tailSafeZone; i >= 0; i-- )
      {
        if(
          px < (trail[i].x + pw)
          && px + pw > trail[i].x
          && py < (trail[i].y + ph)
          && py + ph > trail[i].y
        )
        {
          // получили коллизию
          tail = 10; // отрезаем хвост
          speed = baseSpeed; // урезаем скорость (флэш не более лол xD)
  
          for( let t = 0; t < trail.length; t++ )
          {
            // выделить потерянную область
            trail[t].color = 'red';
  
            if( t >= trail.length - tail )
              {break;}
          }
        }
      }
    }
  
// рисуем яблоки
    for( let a = 0; a < apples.length; a++ )
    {
      ctx.fillStyle = apples[a].color;
      ctx.fillRect(apples[a].x, apples[a].y, aw, ah);
    }
  
    // проверка на столкновение змеиной головы с яблоками
    for( let a = 0; a < apples.length; a++ )
    {
      if(
        px < (apples[a].x + pw)
        && px + pw > apples[a].x
        && py < (apples[a].y + ph)
        && py + ph > apples[a].y
      )
      {
        // произошло столкновение с яблоком
        apples.splice(a, 1); // удалить это яблоко из списка яблок
        tail += 10; // добавляем длину хвоста
        speed += .1; // добавляем немного скорости
        spawnApple(); // создаем еще одно яблоко(-я)
        break;
      }
    }
  }
  

// спавнер яблок
  function spawnApple()
  {
    let
      newApple = {
        x: ~~(Math.random() * canv.width),
        y: ~~(Math.random() * canv.height),
        color: 'red'
      };
  
    // запрещаем спавнить по краям
    if(
      (newApple.x < aw || newApple.x > canv.width - aw)
      ||
      (newApple.y < ah || newApple.y > canv.height - ah)
    )
    {
      spawnApple();
      return;
    }
  
    // проверяем коллизии с хвостовым элементом, чтобы в нем не появлялось яблоко
    for( let i = 0; i < tail.length; i++ )
    {
      if(
        newApple.x < (trail[i].x + pw)
        && newApple.x + aw > trail[i].x
        && newApple.y < (trail[i].y + ph)
        && newApple.y + ah > trail[i].y
      )
      {
// получили коллизию
        spawnApple();
        return;
      }
    }
  
    apples.push(newApple);
  
    if( apples.length < 3 && ~~(Math.random() * 1000) > 700 )
    {
      // 30% шанс породить еще одно яблоко
      spawnApple();
    }
  }
  
   // генератор случайных цветов (для отладки или просто 4fun)
  function rc()
  {
    return '#' + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16));
  }
  
// переключатель скорости (управление)
  function changeDirection(evt)
  {
    if( !fkp && [37,38,39,40].indexOf(evt.keyCode) > -1 )
    {
      setTimeout(function() {gs = true;}, 1000);
      fkp = true;
      spawnApple();
    }
  
    if( cooldown )
      {return false;}
  
    /*
4 направления движения
     */
    if( evt.keyCode == 37 && !(xv > 0) ) // стрелка в лево
      {xv = -speed; yv = 0;}
  
    if( evt.keyCode == 38 && !(yv > 0) ) // стрелка в верх
      {xv = 0; yv = -speed;}
  
    if( evt.keyCode == 39 && !(xv < 0) ) // стрелка в право
      {xv = speed; yv = 0;}
  
    if( evt.keyCode == 40 && !(yv < 0) ) // стрелка вниз
      {xv = 0; yv = speed;}
  
    cooldown = true;
    setTimeout(function() {cooldown = false;}, 100);
  }