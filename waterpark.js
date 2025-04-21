// Waterpark Tycoon - Web Application Game

// Main game container
const game = {
  // Game state
  state: {
    money: 10000,
    visitors: 0,
    satisfaction: 100,
    attractions: [],
    restaurants: [],
    bathrooms: [],
    paths: [],
    decorations: [],
    staff: [],
    lastPlacedItem: null,
    loanUsed: false,
    visitorSprites: [],
    showPaths: false,
    visitorDestinations: [],
    crowdingLevels: {
      pools: 0,
      slides: 0,
      lazyRivers: 0,
      megaSlides: 0,
      wavePools: 0,
      foodStands: 0,
      iceCreamShops: 0,
      bobaShops: 0,
      bathrooms: 0
    }
  },
  
  // Initialize the game
  init: function() {
    console.log("Waterpark Tycoon initialized!");
    this.setupCanvas();
    this.setupEventListeners();
    this.startGameLoop();
    this.updateUI();
  },
  
  // Set up the canvas for the waterpark
  setupCanvas: function() {
    const gameArea = document.getElementById('game-area');
    
    const canvas = document.createElement('canvas');
    canvas.id = 'waterpark-canvas';
    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;
    gameArea.appendChild(canvas);
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Add event listeners for building and placing items
    canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    canvas.addEventListener('mousemove', this.handleCanvasHover.bind(this));
  },
  
  // Set up event listeners for UI elements
  setupEventListeners: function() {
    // Build buttons
    document.getElementById('build-pool').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'pool', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-slide').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'waterslide', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-lazy-river').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'lazyriver', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-mega-slide').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'megaslide', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-wave-pool').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'wavepool', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-food').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'burger', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-ice-cream').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'icecream', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-boba').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'boba', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    document.getElementById('build-bathroom').addEventListener('click', () => {
      this.selectBuildItem({ target: { getAttribute: () => 'bathroom', classList: { contains: () => false, add: () => {}, remove: () => {} } } });
    });
    
    // Toggle paths button
    document.getElementById('toggle-paths').addEventListener('click', this.toggleVisitorPaths.bind(this));
    
    // Loan button
    document.getElementById('take-loan').addEventListener('click', this.getLoan.bind(this));
  },
  
  // Handle selecting a build item
  selectBuildItem: function(e) {
    // Get the item from the button's data attributes
    const item = e.target.getAttribute('data-item') || e.target.getAttribute('id').replace('build-', '');
    
    // Check if this button is already selected
    if (e.target.classList.contains('selected')) {
      // If already selected, deselect it
      e.target.classList.remove('selected');
      this.currentBuildItem = null;
      // Remove placement cursor
      this.canvas.classList.remove('placement-mode');
      console.log(`Deselected ${item}`);
      return;
    }
    
    // Remove 'selected' class from all buttons
    const allButtons = document.querySelectorAll('.control-button');
    allButtons.forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Add 'selected' class to the clicked button
    e.target.classList.add('selected');
    
    // Add placement cursor
    this.canvas.classList.add('placement-mode');
    
    // Determine the type based on the item
    let type;
    if (item === 'pool' || item === 'waterslide' || item === 'lazyriver' || item === 'megaslide' || item === 'wavepool') {
      type = 'attraction';
    } else if (item === 'burger' || item === 'icecream' || item === 'boba') {
      type = 'restaurant';
    } else if (item === 'bathroom') {
      type = 'bathroom';
    }
    
    this.currentBuildItem = {
      type: type,
      item: item
    };
    
    console.log(`Selected ${item} (${type})`);
  },
  
  // Handle clicking on the canvas
  handleCanvasClick: function(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // First check if we clicked on an existing item
    const clickedItem = this.checkItemClick(x, y);
    
    // If we clicked on an item, don't place a new one
    if (clickedItem) {
      return;
    }
    
    // If we're in build mode and didn't click on an existing item, place the new item
    if (this.currentBuildItem) {
      this.buildItem(this.currentBuildItem.type, this.currentBuildItem.item, x, y);
    }
  },
  
  // Check if a click was on an existing item
  checkItemClick: function(x, y) {
    // Check attractions
    for (let i = 0; i < this.state.attractions.length; i++) {
      const attraction = this.state.attractions[i];
      if (this.isPointInItem(x, y, attraction)) {
        this.showItemInfo(attraction);
        return attraction;
      }
    }
    
    // Check restaurants
    for (let i = 0; i < this.state.restaurants.length; i++) {
      const restaurant = this.state.restaurants[i];
      if (this.isPointInItem(x, y, restaurant)) {
        this.showItemInfo(restaurant);
        return restaurant;
      }
    }
    
    // Check bathrooms
    for (let i = 0; i < this.state.bathrooms.length; i++) {
      const bathroom = this.state.bathrooms[i];
      if (this.isPointInItem(x, y, bathroom)) {
        this.showItemInfo(bathroom);
        return bathroom;
      }
    }
    
    // If we didn't click on anything, hide the tooltip
    this.hideItemInfo();
    return null;
  },
  
  // Check if a point is inside an item
  isPointInItem: function(x, y, item) {
    // Different hit detection based on item type
    switch(item.item) {
      case 'waterslide':
        return x >= item.x - 25 && x <= item.x + 25 && y >= item.y - 25 && y <= item.y + 25;
      case 'pool':
        const dx = x - item.x;
        const dy = y - item.y;
        return Math.sqrt(dx * dx + dy * dy) <= 30;
      case 'lazyriver':
        const lrdx = x - item.x;
        const lrdy = y - item.y;
        const lrdist = Math.sqrt(lrdx * lrdx + lrdy * lrdy);
        return lrdist >= 30 && lrdist <= 50;
      case 'megaslide':
        return x >= item.x - 35 && x <= item.x + 35 && y >= item.y - 35 && y <= item.y + 35;
      case 'wavepool':
        const wpdx = x - item.x;
        const wpdy = y - item.y;
        return Math.sqrt(wpdx * wpdx + wpdy * wpdy) <= 35;
      case 'burger':
        return x >= item.x - 20 && x <= item.x + 20 && y >= item.y - 20 && y <= item.y + 20;
      case 'icecream':
        const icdx = x - item.x;
        const icdy = y - item.y;
        return Math.sqrt(icdx * icdx + icdy * icdy) <= 20;
      case 'boba':
        return x >= item.x - 15 && x <= item.x + 15 && y >= item.y - 15 && y <= item.y + 15;
      case 'bathroom':
        return x >= item.x - 15 && x <= item.x + 15 && y >= item.y - 15 && y <= item.y + 15;
      default:
        return false;
    }
  },
  
  // Show information about an item
  showItemInfo: function(item) {
    const tooltip = document.querySelector('.tooltip');
    const tooltipContainer = document.querySelector('.tooltip-container');
    
    // Count visitors at this item
    let visitorCount = 0;
    let totalEnjoyment = 0;
    let happyVisitors = 0;
    let neutralVisitors = 0;
    let unhappyVisitors = 0;
    
    this.state.visitorSprites.forEach(visitor => {
      if (visitor.destination === item) {
        visitorCount++;
        totalEnjoyment += visitor.enjoyment;
        
        if (visitor.mood === 'happy') happyVisitors++;
        else if (visitor.mood === 'neutral') neutralVisitors++;
        else if (visitor.mood === 'unhappy') unhappyVisitors++;
      }
    });
    
    // Calculate average enjoyment
    const avgEnjoyment = visitorCount > 0 ? (totalEnjoyment / visitorCount * 100).toFixed(0) : 0;
    
    // Format item name
    let itemName = item.item;
    if (itemName === 'waterslide') itemName = 'Water Slide';
    if (itemName === 'lazyriver') itemName = 'Lazy River';
    if (itemName === 'megaslide') itemName = 'Mega Slide';
    if (itemName === 'wavepool') itemName = 'Wave Pool';
    if (itemName === 'burger') itemName = 'Food Stand';
    if (itemName === 'icecream') itemName = 'Ice Cream Shop';
    if (itemName === 'boba') itemName = 'Boba Shop';
    
    // Format item type
    let itemType = item.type;
    if (itemType === 'attraction') itemType = 'Attraction';
    if (itemType === 'restaurant') itemType = 'Food';
    if (itemType === 'bathroom') itemType = 'Facility';
    
    // Create tooltip content
    let content = `
      <div class="tooltip-header">${itemName}</div>
      <div class="tooltip-type">${itemType}</div>
      <div class="tooltip-satisfaction">Satisfaction: ${item.satisfaction}%</div>
      <div class="tooltip-visitors">Current Visitors: ${visitorCount}</div>
    `;
    
    // Add enjoyment information if there are visitors
    if (visitorCount > 0) {
      content += `
        <div class="tooltip-enjoyment">Average Enjoyment: ${avgEnjoyment}%</div>
        <div class="tooltip-moods">
          <span class="mood-happy">😊 ${happyVisitors}</span>
          <span class="mood-neutral">😐 ${neutralVisitors}</span>
          <span class="mood-unhappy">😞 ${unhappyVisitors}</span>
        </div>
      `;
    }
    
    // Add specific information based on item type
    if (item.type === 'attraction') {
      content += `<div class="tooltip-info">Popular attraction for visitors!</div>`;
    } else if (item.type === 'restaurant') {
      content += `<div class="tooltip-info">Feeds hungry visitors!</div>`;
    } else if (item.type === 'bathroom') {
      content += `<div class="tooltip-info">Essential facility for visitor comfort!</div>`;
    }
    
    // Update tooltip
    tooltip.innerHTML = content;
    
    // Position tooltip near the item
    tooltipContainer.style.left = `${item.x + 50}px`;
    tooltipContainer.style.top = `${item.y - 50}px`;
    tooltipContainer.style.display = 'block';
    
    // Store the current item for reference
    this.currentItemInfo = item;
  },
  
  // Hide the item information tooltip
  hideItemInfo: function() {
    const tooltipContainer = document.querySelector('.tooltip-container');
    tooltipContainer.style.display = 'none';
    this.currentItemInfo = null;
  },
  
  // Handle mouse hover on the canvas
  handleCanvasHover: function(e) {
    if (!this.currentBuildItem) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Store the current mouse position for preview
    this.previewPosition = { x, y };
    
    // Redraw the park with the preview
    this.drawPark();
    this.drawPreview();
  },
  
  // Build an item at the specified location
  buildItem: function(type, item, x, y) {
    const costs = {
      waterslide: 1000,
      pool: 500,
      lazyriver: 2000,
      megaslide: 3000,
      wavepool: 2500,
      burger: 300,
      icecream: 400,
      boba: 500,
      bathroom: 300
    };
    
    // Define maximum number of each item type
    const maxItems = {
      waterslide: 3,
      pool: 4,
      lazyriver: 2,
      megaslide: 2,
      wavepool: 2,
      burger: 3,
      icecream: 2,
      boba: 2,
      bathroom: 3
    };
    
    const cost = costs[item];
    
    // Count existing items of this type
    let existingCount = 0;
    if (type === 'attraction') {
      existingCount = this.state.attractions.filter(a => a.item === item).length;
    } else if (type === 'restaurant') {
      existingCount = this.state.restaurants.filter(r => r.item === item).length;
    } else if (type === 'bathroom') {
      existingCount = this.state.bathrooms.filter(b => b.item === item).length;
    }
    
    if (existingCount >= maxItems[item]) {
      alert(`You can have a maximum of ${maxItems[item]} ${item}s in your waterpark!`);
      return;
    }
    
    if (this.state.money >= cost) {
      this.state.money -= cost;
      
      const newItem = {
        type: type,
        item: item,
        x: x,
        y: y,
        satisfaction: this.getItemSatisfaction(item),
        visitors: []
      };
      
      switch(type) {
        case 'attraction':
          this.state.attractions.push(newItem);
          break;
        case 'restaurant':
          this.state.restaurants.push(newItem);
          break;
        case 'bathroom':
          this.state.bathrooms.push(newItem);
          break;
      }
      
      // Store the last placed item
      this.state.lastPlacedItem = {
        type: type,
        item: newItem
      };
      
      this.updateUI();
      this.drawPark();
      
      console.log(`Built ${item} at (${x}, ${y})`);
    } else {
      alert("Not enough money!");
    }
  },
  
  // Get satisfaction value for an item
  getItemSatisfaction: function(item) {
    const satisfactionValues = {
      waterslide: 20,
      pool: 15,
      lazyriver: 25,
      megaslide: 30,
      wavepool: 22,
      burger: 18,
      icecream: 12,
      boba: 15,
      bathroom: 10
    };
    
    return satisfactionValues[item] || 0;
  },
  
  // Update the UI with current game state
  updateUI: function() {
    document.getElementById('money').textContent = `$${this.state.money}`;
    document.getElementById('visitors').textContent = this.state.visitors;
    document.getElementById('happiness').textContent = `${this.state.satisfaction}%`;
    document.getElementById('loans').textContent = this.state.loanUsed ? '$1000' : '$0';
    
    // Update loan button state
    const loanButton = document.getElementById('take-loan');
    if (loanButton) {
      loanButton.disabled = this.state.loanUsed;
      if (this.state.loanUsed) {
        loanButton.classList.add('used');
      }
    }
    
    // Update crowding levels
    this.updateCrowdingLevels();
  },
  
  // Get a one-time loan
  getLoan: function() {
    if (this.state.loanUsed) return;
    
    this.state.money += 1000;
    this.state.loanUsed = true;
    
    // Update loan button
    const loanButton = document.getElementById('take-loan');
    if (loanButton) {
      loanButton.disabled = true;
      loanButton.classList.add('used');
    }
    
    this.updateUI();
    alert("You received a $1000 loan!");
  },
  
  // Draw the waterpark on the canvas
  drawPark: function() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB'; // Sky blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw attractions
    this.state.attractions.forEach(attraction => {
      switch(attraction.item) {
        case 'waterslide':
          this.ctx.fillStyle = '#0000FF';
          this.ctx.fillRect(attraction.x - 25, attraction.y - 25, 50, 50);
          break;
        case 'pool':
          this.ctx.fillStyle = '#00FFFF';
          this.ctx.beginPath();
          this.ctx.arc(attraction.x, attraction.y, 30, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        case 'lazyriver':
          this.ctx.strokeStyle = '#00FFFF';
          this.ctx.lineWidth = 10;
          this.ctx.beginPath();
          this.ctx.arc(attraction.x, attraction.y, 40, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
        case 'megaslide':
          this.ctx.fillStyle = '#FF00FF';
          this.ctx.fillRect(attraction.x - 35, attraction.y - 35, 70, 70);
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.fillRect(attraction.x - 25, attraction.y - 25, 50, 50);
          break;
        case 'wavepool':
          this.ctx.fillStyle = '#00FFFF';
          this.ctx.beginPath();
          this.ctx.arc(attraction.x, attraction.y, 35, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.strokeStyle = '#FFFFFF';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(attraction.x, attraction.y, 35, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
      }
    });
    
    // Draw restaurants
    this.state.restaurants.forEach(restaurant => {
      switch(restaurant.item) {
        case 'burger':
          this.ctx.fillStyle = '#8B4513';
          this.ctx.fillRect(restaurant.x - 20, restaurant.y - 20, 40, 40);
          this.ctx.fillStyle = '#FFD700';
          this.ctx.fillRect(restaurant.x - 15, restaurant.y - 15, 30, 10);
          break;
        case 'icecream':
          this.ctx.fillStyle = '#FFC0CB';
          this.ctx.beginPath();
          this.ctx.arc(restaurant.x, restaurant.y, 20, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.beginPath();
          this.ctx.arc(restaurant.x, restaurant.y - 5, 10, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        case 'boba':
          this.ctx.fillStyle = '#8B4513';
          this.ctx.fillRect(restaurant.x - 15, restaurant.y - 15, 30, 30);
          this.ctx.fillStyle = '#FF69B4';
          this.ctx.beginPath();
          this.ctx.arc(restaurant.x, restaurant.y, 10, 0, Math.PI * 2);
          this.ctx.fill();
          break;
      }
    });
    
    // Draw bathrooms
    this.state.bathrooms.forEach(bathroom => {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(bathroom.x - 15, bathroom.y - 15, 30, 30);
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bathroom.x - 15, bathroom.y - 15, 30, 30);
      
      // Draw door
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(bathroom.x - 5, bathroom.y - 10, 10, 20);
    });
    
    // Draw visitors
    this.drawVisitors();
    
    // Draw visitor paths if enabled
    if (this.state.showPaths) {
      this.drawVisitorPaths();
    }
  },
  
  // Draw visitors in the park
  drawVisitors: function() {
    // Clear old visitor sprites if needed
    if (this.state.visitorSprites.length > this.state.visitors) {
      this.state.visitorSprites = this.state.visitorSprites.slice(0, this.state.visitors);
    }
    
    // Add new visitor sprites if needed
    while (this.state.visitorSprites.length < this.state.visitors) {
      this.state.visitorSprites.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        color: this.getRandomVisitorColor(),
        size: Math.random() * 5 + 5,
        destination: null,
        enjoyment: 0,
        stayTime: 0,
        maxStayTime: Math.floor(Math.random() * 100) + 50, // Random stay time between 50-150 frames
        mood: 'neutral', // Can be 'happy', 'neutral', or 'unhappy'
        activity: 'walking', // Can be 'walking', 'enjoying', 'eating', 'bathroom'
        activityProgress: 0
      });
    }
    
    // Draw visitor sprites
    this.state.visitorSprites.forEach(visitor => {
      // Draw visitor body
      this.ctx.fillStyle = visitor.color;
      this.ctx.beginPath();
      this.ctx.arc(visitor.x, visitor.y, visitor.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw visitor head
      this.ctx.fillStyle = '#FFD700';
      this.ctx.beginPath();
      this.ctx.arc(visitor.x, visitor.y - visitor.size/2, visitor.size/2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw visitor arms
      this.ctx.strokeStyle = visitor.color;
      this.ctx.lineWidth = 2;
      
      // Arms position based on activity
      if (visitor.activity === 'walking') {
        // Walking arms
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x - visitor.size/2, visitor.y);
        this.ctx.lineTo(visitor.x - visitor.size, visitor.y - visitor.size/2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x + visitor.size/2, visitor.y);
        this.ctx.lineTo(visitor.x + visitor.size, visitor.y + visitor.size/2);
        this.ctx.stroke();
      } else if (visitor.activity === 'enjoying') {
        // Raised arms for enjoying
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x - visitor.size/2, visitor.y);
        this.ctx.lineTo(visitor.x - visitor.size, visitor.y - visitor.size);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x + visitor.size/2, visitor.y);
        this.ctx.lineTo(visitor.x + visitor.size, visitor.y - visitor.size);
        this.ctx.stroke();
      } else if (visitor.activity === 'eating') {
        // One arm raised for eating
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x - visitor.size/2, visitor.y);
        this.ctx.lineTo(visitor.x - visitor.size, visitor.y - visitor.size/2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x + visitor.size/2, visitor.y);
        this.ctx.lineTo(visitor.x + visitor.size/2, visitor.y - visitor.size/2);
        this.ctx.stroke();
      }
      
      // Draw visitor legs
      this.ctx.beginPath();
      this.ctx.moveTo(visitor.x - visitor.size/3, visitor.y + visitor.size/2);
      this.ctx.lineTo(visitor.x - visitor.size/2, visitor.y + visitor.size);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(visitor.x + visitor.size/3, visitor.y + visitor.size/2);
      this.ctx.lineTo(visitor.x + visitor.size/2, visitor.y + visitor.size);
      this.ctx.stroke();
      
      // Draw facial expression based on mood
      this.ctx.fillStyle = '#000000';
      
      // Eyes
      this.ctx.beginPath();
      this.ctx.arc(visitor.x - visitor.size/4, visitor.y - visitor.size/2, visitor.size/8, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.beginPath();
      this.ctx.arc(visitor.x + visitor.size/4, visitor.y - visitor.size/2, visitor.size/8, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Mouth based on mood
      if (visitor.mood === 'happy') {
        // Happy smile
        this.ctx.beginPath();
        this.ctx.arc(visitor.x, visitor.y - visitor.size/2, visitor.size/3, 0, Math.PI);
        this.ctx.stroke();
      } else if (visitor.mood === 'unhappy') {
        // Unhappy frown
        this.ctx.beginPath();
        this.ctx.arc(visitor.x, visitor.y - visitor.size/2 + visitor.size/6, visitor.size/3, Math.PI, Math.PI * 2);
        this.ctx.stroke();
      } else {
        // Neutral straight line
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x - visitor.size/3, visitor.y - visitor.size/2);
        this.ctx.lineTo(visitor.x + visitor.size/3, visitor.y - visitor.size/2);
        this.ctx.stroke();
      }
      
      // Draw enjoyment meter above visitor
      this.drawEnjoymentMeter(visitor);
    });
  },
  
  // Draw enjoyment meter above visitor
  drawEnjoymentMeter: function(visitor) {
    const meterWidth = visitor.size * 2;
    const meterHeight = 3;
    const x = visitor.x - meterWidth / 2;
    const y = visitor.y - visitor.size - 5;
    
    // Background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, meterWidth, meterHeight);
    
    // Fill based on enjoyment
    let fillColor;
    if (visitor.enjoyment < 0.3) {
      fillColor = '#FF0000'; // Red for low enjoyment
    } else if (visitor.enjoyment < 0.7) {
      fillColor = '#FFFF00'; // Yellow for medium enjoyment
    } else {
      fillColor = '#00FF00'; // Green for high enjoyment
    }
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, meterWidth * visitor.enjoyment, meterHeight);
  },
  
  // Get a random color for visitors
  getRandomVisitorColor: function() {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEEAD', // Yellow
      '#D4A5A5', // Pink
      '#9B59B6', // Purple
      '#3498DB'  // Light Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },
  
  // Generate visitors for the park
  generateVisitors: function() {
    if (this.state.attractions.length > 0) {
      const newVisitors = Math.floor(Math.random() * 3) + 1;
      this.state.visitors += newVisitors;
      
      // Calculate overall satisfaction
      let totalSatisfaction = 0;
      
      // Count all items that contribute to satisfaction
      const allItems = [
        ...this.state.attractions,
        ...this.state.restaurants,
        ...this.state.bathrooms
      ];
      
      allItems.forEach(item => {
        totalSatisfaction += item.satisfaction;
      });
      
      // Update overall satisfaction (max 100%)
      this.state.satisfaction = Math.min(
        Math.floor(totalSatisfaction / (this.state.visitors * 0.5)),
        100
      );
      
      // Generate revenue based on visitors and satisfaction
      const revenue = this.state.visitors * (this.state.satisfaction / 100) * 5;
      this.state.money += Math.floor(revenue);
      
      this.updateUI();
    }
  },
  
  // Draw a preview of the item being placed
  drawPreview: function() {
    if (!this.currentBuildItem || !this.previewPosition) return;
    
    const { x, y } = this.previewPosition;
    const { type, item } = this.currentBuildItem;
    
    // Set semi-transparent style for preview
    this.ctx.globalAlpha = 0.5;
    
    // Draw preview based on item type
    switch(type) {
      case 'attraction':
        switch(item) {
          case 'waterslide':
            this.ctx.fillStyle = '#0000FF';
            this.ctx.fillRect(x - 25, y - 25, 50, 50);
            break;
          case 'pool':
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'lazyriver':
            this.ctx.strokeStyle = '#00FFFF';
            this.ctx.lineWidth = 10;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 40, 0, Math.PI * 2);
            this.ctx.stroke();
            break;
          case 'megaslide':
            this.ctx.fillStyle = '#FF00FF';
            this.ctx.fillRect(x - 35, y - 35, 70, 70);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(x - 25, y - 25, 50, 50);
            break;
          case 'wavepool':
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 35, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 35, 0, Math.PI * 2);
            this.ctx.stroke();
            break;
        }
        break;
      case 'restaurant':
        switch(item) {
          case 'burger':
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x - 20, y - 20, 40, 40);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(x - 15, y - 15, 30, 10);
            break;
          case 'icecream':
            this.ctx.fillStyle = '#FFC0CB';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(x, y - 5, 10, 0, Math.PI * 2);
            this.ctx.fill();
            break;
          case 'boba':
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(x - 15, y - 15, 30, 30);
            this.ctx.fillStyle = '#FF69B4';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10, 0, Math.PI * 2);
            this.ctx.fill();
            break;
        }
        break;
      case 'bathroom':
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x - 15, y - 15, 30, 30);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 15, y - 15, 30, 30);
        
        // Draw door
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x - 5, y - 10, 10, 20);
        break;
    }
    
    // Reset transparency
    this.ctx.globalAlpha = 1.0;
  },
  
  // Start the game loop
  startGameLoop: function() {
    // Update visitors and generate new ones every 5 seconds
    setInterval(() => {
      this.generateVisitors();
      this.updateUI();
    }, 5000);
    
    // Update visitor positions every 100ms for smooth movement
    setInterval(() => {
      this.updateVisitors();
      this.drawPark();
    }, 100);
  },
  
  // Update visitor positions
  updateVisitors: function() {
    this.state.visitorSprites.forEach(visitor => {
      // If paths are shown, update based on destination
      if (this.state.showPaths && visitor.destination) {
        // Move toward destination
        const dx = visitor.destination.x - visitor.x;
        const dy = visitor.destination.y - visitor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If reached destination, start enjoying
        if (distance < 10) {
          // If not already enjoying, start enjoying
          if (visitor.activity !== 'enjoying' && visitor.activity !== 'eating' && visitor.activity !== 'bathroom') {
            visitor.activity = 'enjoying';
            visitor.stayTime = 0;
            visitor.activityProgress = 0;
          }
          
          // Stay at destination for a while
          visitor.stayTime++;
          
          // Increase enjoyment while at destination
          if (visitor.stayTime % 10 === 0) { // Every 10 frames
            visitor.enjoyment = Math.min(1, visitor.enjoyment + 0.05);
            
            // Update mood based on enjoyment
            if (visitor.enjoyment > 0.7) {
              visitor.mood = 'happy';
            } else if (visitor.enjoyment < 0.3) {
              visitor.mood = 'unhappy';
            } else {
              visitor.mood = 'neutral';
            }
          }
          
          // If stayed long enough, pick a new destination
          if (visitor.stayTime >= visitor.maxStayTime) {
            this.pickNewDestination(visitor);
          }
        } else {
          // Move toward destination
          visitor.x += visitor.dx;
          visitor.y += visitor.dy;
          visitor.activity = 'walking';
        }
      } else {
        // Random movement
        visitor.x += visitor.dx;
        visitor.y += visitor.dy;
        visitor.activity = 'walking';
        
        // Bounce off canvas edges
        if (visitor.x < 0 || visitor.x > this.canvas.width) visitor.dx *= -1;
        if (visitor.y < 0 || visitor.y > this.canvas.height) visitor.dy *= -1;
      }
    });
    
    // Update tooltip if an item is selected
    if (this.currentItemInfo) {
      this.showItemInfo(this.currentItemInfo);
    }
  },
  
  // Toggle visitor path visualization
  toggleVisitorPaths: function() {
    this.state.showPaths = !this.state.showPaths;
    const button = document.getElementById('toggle-paths');
    
    if (this.state.showPaths) {
      button.textContent = 'Hide Visitor Paths';
      button.classList.add('active');
      this.updateVisitorDestinations();
    } else {
      button.textContent = 'Show Visitor Paths';
      button.classList.remove('active');
    }
  },
  
  // Update visitor destination preferences
  updateVisitorDestinations: function() {
    if (!this.state.showPaths) return;
    
    // Clear old destinations
    this.state.visitorDestinations = [];
    
    // Get all possible destinations
    const allDestinations = [
      ...this.state.attractions,
      ...this.state.restaurants,
      ...this.state.bathrooms
    ];
    
    if (allDestinations.length === 0) return;
    
    // Assign random destinations to visitors
    this.state.visitorSprites.forEach(visitor => {
      const randomDest = allDestinations[Math.floor(Math.random() * allDestinations.length)];
      visitor.destination = randomDest;
      
      // Calculate direction to destination
      const dx = randomDest.x - visitor.x;
      const dy = randomDest.y - visitor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        visitor.dx = (dx / distance) * 1.5;
        visitor.dy = (dy / distance) * 1.5;
      }
    });
  },
  
  // Draw visitor paths
  drawVisitorPaths: function() {
    this.state.visitorSprites.forEach(visitor => {
      if (visitor.destination) {
        // Draw path to destination
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(visitor.x, visitor.y);
        this.ctx.lineTo(visitor.destination.x, visitor.destination.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw destination marker
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(visitor.destination.x, visitor.destination.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  },
  
  // Update crowding levels display
  updateCrowdingLevels: function() {
    // Count visitors near each destination
    const poolCount = this.state.attractions.filter(a => a.item === 'pool').length;
    const slideCount = this.state.attractions.filter(a => a.item === 'waterslide').length;
    const lazyRiverCount = this.state.attractions.filter(a => a.item === 'lazyriver').length;
    const megaSlideCount = this.state.attractions.filter(a => a.item === 'megaslide').length;
    const wavePoolCount = this.state.attractions.filter(a => a.item === 'wavepool').length;
    const foodCount = this.state.restaurants.filter(r => r.item === 'burger').length;
    const iceCreamCount = this.state.restaurants.filter(r => r.item === 'icecream').length;
    const bobaCount = this.state.restaurants.filter(r => r.item === 'boba').length;
    const bathroomCount = this.state.bathrooms.length;
    
    // Count visitors heading to each destination
    let poolVisitors = 0;
    let slideVisitors = 0;
    let lazyRiverVisitors = 0;
    let megaSlideVisitors = 0;
    let wavePoolVisitors = 0;
    let foodVisitors = 0;
    let iceCreamVisitors = 0;
    let bobaVisitors = 0;
    let bathroomVisitors = 0;
    
    this.state.visitorSprites.forEach(visitor => {
      if (visitor.destination) {
        if (visitor.destination.type === 'attraction') {
          if (visitor.destination.item === 'pool') poolVisitors++;
          if (visitor.destination.item === 'waterslide') slideVisitors++;
          if (visitor.destination.item === 'lazyriver') lazyRiverVisitors++;
          if (visitor.destination.item === 'megaslide') megaSlideVisitors++;
          if (visitor.destination.item === 'wavepool') wavePoolVisitors++;
        } else if (visitor.destination.type === 'restaurant') {
          if (visitor.destination.item === 'burger') foodVisitors++;
          if (visitor.destination.item === 'icecream') iceCreamVisitors++;
          if (visitor.destination.item === 'boba') bobaVisitors++;
        } else if (visitor.destination.type === 'bathroom') {
          bathroomVisitors++;
        }
      }
    });
    
    // Update crowding displays
    document.getElementById('pool-crowding').textContent = `${poolVisitors}/${poolCount}`;
    document.getElementById('slide-crowding').textContent = `${slideVisitors}/${slideCount}`;
    document.getElementById('lazy-river-crowding').textContent = `${lazyRiverVisitors}/${lazyRiverCount}`;
    document.getElementById('mega-slide-crowding').textContent = `${megaSlideVisitors}/${megaSlideCount}`;
    document.getElementById('wave-pool-crowding').textContent = `${wavePoolVisitors}/${wavePoolCount}`;
    document.getElementById('food-crowding').textContent = `${foodVisitors}/${foodCount}`;
    document.getElementById('ice-cream-crowding').textContent = `${iceCreamVisitors}/${iceCreamCount}`;
    document.getElementById('boba-crowding').textContent = `${bobaVisitors}/${bobaCount}`;
    document.getElementById('bathroom-crowding').textContent = `${bathroomVisitors}/${bathroomCount}`;
  },
  
  // Pick a new destination for a visitor
  pickNewDestination: function(visitor) {
    // Get all possible destinations
    const allDestinations = [
      ...this.state.attractions,
      ...this.state.restaurants,
      ...this.state.bathrooms
    ];
    
    if (allDestinations.length === 0) return;
    
    // Pick a random destination
    const randomDest = allDestinations[Math.floor(Math.random() * allDestinations.length)];
    visitor.destination = randomDest;
    
    // Calculate direction to destination
    const dx = randomDest.x - visitor.x;
    const dy = randomDest.y - visitor.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      visitor.dx = (dx / distance) * 1.5;
      visitor.dy = (dy / distance) * 1.5;
    }
  }
};

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  game.init();
}); 