
var getPlantsFromServer = function(type){
    if(type=='all'){
        return fetch("https://plant-nursery.herokuapp.com/plants");
    }
    return fetch("https://plant-nursery.herokuapp.com/plants/?typeEquals="+type);

};

var getOnePlantFromServer=function(plantId){
    return fetch("https://plant-nursery.herokuapp.com/plants"+plantId);
};  

var addPlantOnServer=function(newName,newClimate,newType,newDescription){
    var data= `name=${encodeURIComponent(newName)}`;
    data+= `&climate=${encodeURIComponent(newClimate)}`;
    data+= `&type=${encodeURIComponent(newType)}`;
    data+= `&description=${encodeURIComponent(newDescription)}`;
    return fetch("https://plant-nursery.herokuapp.com/plants", {
        body:data,
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        }
    });
};

var updatePlantOnServer=function(plantID,newName,newClimate,newType,newDescription){
    var data= `name=${encodeURIComponent(newName)}`;
    data+= `&climate=${encodeURIComponent(newClimate)}`;
    data+= `&type=${encodeURIComponent(newType)}`;
    data+= `&description=${encodeURIComponent(newDescription)}`;
    return fetch("https://plant-nursery.herokuapp.com/plants/"+plantID, {
        body:data,
        method:"PUT",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        }
    });
};  
var deletePlantOnServer=function(plantId){
    return fetch("https://plant-nursery.herokuapp.com/plants/"+plantId,{
        method:"DELETE",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        }
        
    });
};

var app = new Vue({
    el: "#app",
    data: {
        newPlantName:"",
        newPlantClimate:"",
        newPlantType:"",
        newPlantDescription:"",
        plantID:"",
        page:"Home",
        plants:[],
        typeShown:[],
        selected:"",
        showCreatePlant:false,
        errors:[],
        showAllofPlants:false,
        pageshow:false,
        editplant:false,
        home:true,
        plantID:"",
        editname:"",
        editclimate:"",
        editType:"",
        editDescription:"",
        typeDescription:"",
    },
    methods:{
        showPlants: function() {
            getPlantsFromServer('all').then((response)=>{
                response.json().then((plants)=>{
                    console.log("Here are the plants:",plants);
                    this.plants=plants;
                    
                });
            });
        },
        descriptionoftype:function(page){
            if(page=='Flower'){
                this.typeDescription="A flower, sometimes known as a bloom or blossom, is the reproductive structure found in flowering plants (plants of the division Magnoliophyta, also called angiosperms). The biological function of a flower is to affect reproduction, usually by providing a mechanism for the union of sperm with eggs. Flowers may facilitate outcrossing (fusion of sperm and eggs from different individuals in a population) resulting from cross pollination or allow selfing (fusion of sperm and egg from the same flower) when self pollination occurs. ";
            }
            if(page =='Tree'){
                this.typeDescription="In botany, a tree is a perennial plant with an elongated stem, or trunk, supporting branches and leaves in most species. In some usages, the definition of a tree may be narrower, including only woody plants with secondary growth, plants that are usable as lumber or plants above a specified height. In wider definitions, the taller palms, tree ferns, bananas, and bamboos are also trees. Trees are not a taxonomic group but include a variety of plant species that have independently evolved a trunk and branches as a way to tower above other plants to compete for sunlight. Trees tend to be long-lived, some reaching several thousand years old. Trees have been in existence for 370 million years. It is estimated that there are just over 3 trillion mature trees in the world.";
            }
            if(page =='Shrub'){
                this.typeDescription="Shrub, any woody plant that has several stems, none dominant, and is usually less than 3 m (10 feet) tall. When much-branched and dense, it may be called a bush. Intermediate between shrubs and trees are arborescences, or treelike shrubs, from 3 to 6 m tall. Trees are generally defined as woody plants more than 6 m tall, having a dominant stem, or trunk, and a definite crown shape. These distinctions are not reliable, however, for there are some shrubs, such as lilacs and honeysuckles, that, under especially favourable environmental conditions, grow to the size of an arborescence or even a small tree. Some specimens of a plant species may take a tree form, whereas others, under different conditions, may assume a shrub or arborescent form."
            }
            if(page=='Other'){
                this.typeDescription="This is a wide variety of other plants such as succulents, cactus, bulbs, ferns, etc.";
            }
        },
        close:function(){
            this.showCreatePlant=false;
            this.editplant=false;
        },
        Edit:function(plantId,name,climate,typeP,description){
            this.editplant=true;
            this.plantID=plantId;
            this.editname=name;
            this.editclimate=climate;
            this.editType=typeP;
            this.editDescription=description;
        },
        addPlant:function(){
            this.showCreatePlant=true;
        },
        showPage:function(){
            this.showAllofPlants=true;
            this.home=false;
            this.pageshow=false;
        },
        showHome:function(){
            this.home=true;
            this.pageShow=false;
            this.showAllofPlants=false;
        },
        validatePlant:function(){
            this.errors=[];
            if(this.newPlantName == ""){
                this.errors.push("Please enter plant name");
            }
            if( this.newPlantClimate==""){
                this.errors.push("Please enter plant climate");
            }
            if(this.newPlantType ==""){
                this.errors.push("Please enter plant type");
            }
            if(this.newPlantDescription==""){
                this.errors.push("Please enter description");
            }
            if(this.errors.length>0){
                return false;
            }else{
                return true;
            }
        },
        AddButtonClicked: function() {
            if(!this.validatePlant()){
                return;
            }
            this.showCreatePlant=false;

            console.log("You clicked add button");
            addPlantOnServer(this.newPlantName,this.newPlantClimate,this.newPlantType,this.newPlantDescription).then((response)=>{
                if(response.status==201){
                    this.showPlants();
                    this.newPlantName="";
                    this.newPlantClimate="";
                    this.newPlantType="";
                    this.newPlantDescription="";
                }else if (response.status==422){
                }else{
                    alert("Something is not working...")
                }

            });
        },
        deleteButtonClicked:function(plantId){
            console.log("You clicked delete button");
            deletePlantOnServer(plantId).then((response)=>{
                if(response.status==200){
                    this.showPlants();
                }
                
                
            });

        },
        updateButtonClicked:function(){
            console.log("You clicked edit button");
            updatePlantOnServer(this.plantID,this.editname,this.editclimate,this.editType,this.editDescription).then((response)=>{
                if (response.status==200){
                    this.showPlants();
                    this.editplant=false;
                }
            });

        },
        filterButtonClicked:function(type){
            getPlantsFromServer(type).then((response)=>{
                response.json().then((plants)=>{
                    console.log("Here are the plants:",plants);
                    this.typeShown=plants;
                    this.showAllofPlants=false;
                    this.pageshow=true;
                    this.home=false;
                });
            });
        }
        
    },
    created: function(){
        console.log("Vue loaded.");
        this.showPlants();
    },
    // the arrow function => outer inherits.
    //normal function() doesnt inherit. 
  });