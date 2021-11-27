const fs = require('fs');
const dbfunctions = require('./dbfunctions.js');

function LearnRoadmap(roadmap_directory_name,callback){
    // console.log(roadmap_directory_name);
    fs.readdir(roadmap_directory_name,(error,result)=>{
        if(error)
        {
            callback(error,null);
        }
        else
        {
            //for each roadmaps files
            // console.log(result);
            result.forEach(roadmap_json_file=>{
                // console.log(roadmap_directory_name+roadmap_json_file);
                fs.readFile(roadmap_directory_name+roadmap_json_file,(error,result)=>{
                    if(error)
                    {
                        callback(error,null);
                    }
                    else
                    {
                        var roadmap_json = JSON.parse(result);
                        const roadmap_actions_keys = Object.keys(roadmap_json); 
                        const roadmap_actions_count = roadmap_actions_keys.length;
                        for(var i = 0; i < roadmap_actions_count; i++)
                        {
                            switch(roadmap_actions_keys[i])
                            {
                                case 'add':{
                                    var department_name = roadmap_json['add']['department']['name'];
                                    var designation_name = roadmap_json['add']['department']['designation']['name'];
                                    designation_name = designation_name.split(" ");
                                    var designation_name_string = "";
                                    designation_name.forEach((word,index)=>{
                                        designation_name_string += word[0].toUpperCase() + word.slice(1);
                                        if(index < designation_name.length - 1)
                                        {
                                            designation_name_string += " ";
                                        }
                                    });
                                    const designation_roadmap = JSON.stringify(roadmap_json['add']['department']['designation']['roadmap']);
                                    // console.log(designation_roadmap);
                                   RoadmapCreation(department_name,designation_name_string,designation_roadmap,(error,result)=>{
                                        if(error)
                                        {
                                            callback(error,null);
                                        }
                                        else
                                        {
                                            callback(null, result);
                                        }
                                    });
                                }break;
                                case 'update':{
                                    UpdateRoadmap(roadmap_json['update'],(error,result)=>{
                                        if(error)
                                        {
                                            callback(error,null);
                                        }
                                        else
                                        {
                                            callback(null,result);
                                        }
                                    });
                                }break;
                                case 'delete':{
                                    DeteteInRoadmaps(roadmap_json['delete'],(error,result)=>{
                                        if(error)
                                        {
                                            callback(error,null);
                                        }
                                        else
                                        {
                                            callback(null,result);
                                        }
                                    });
                                }break;
                            }
                        }
                        //move the file from this directory to roadmaps directory
                        fs.rename(roadmap_directory_name+roadmap_json_file,"public/assets/roadmaps/"+roadmap_json_file,(error,result)=>{
                            if(error)
                            {
                                console.log(error);
                            }
                            else
                            {
                                console.log('roadmap archived!');
                            }
                        });
                    }
                });
            });
        }
    });
}

function RoadmapCreation(department_name,designation_name,designation_roadmap,callback){
    dbfunctions.AnyDbQuery("select id from fields_departments where department_name='"+department_name+"'",(error,result)=>{
        if(error)
        {
            callback(error,null);
        }
        else
        {
            // console.log(Object.values(JSON.parse(JSON.stringify(result))));
            if(Object.values(JSON.parse(JSON.stringify(result))).length)
            {
                
                //department is present                
                console.log("department Present");

                //create designation
                var datetime = dbfunctions.DateTime(0,0,0,0,0,0);
                var department_id = result[0].id; //department id

                //check if designation under this department is already present or not
                dbfunctions.AnyDbQuery("select designation_name from designation where department_id='"+department_id+"' and designation_name='"+designation_name+"'",(error,result)=>{
                    if(error)
                    {
                        callback(error,null);
                    }
                    else
                    {
                        if(!Object.values(JSON.parse(JSON.stringify(result))).length)
                        {
                            //if designation is not present then insert it into database 
                            dbfunctions.InsertDataInTable("designation","id,department_id,designation_name,roadmap,priority,clicks,updated_datetime,create_datetime","'','"+department_id+"','"+designation_name+"','"+designation_roadmap+"','0','0','"+datetime+"','"+datetime+"'",(error,result)=>{
                                if(error)
                                {
                                    console.log(error);
                                }
                                else
                                {
                                    if(result.affectedRows)
                                    {                                        
                                        console.log(designation_name+" saved! \n");
                                    }
                                    else
                                    {                                        
                                        console.log("unable to save "+designation_name+"\n");
                                    }
                                }
                            });
                        }
                    }
                });
            }
            else
            {
                //department is not present 
                
                //create the department

                console.log("creating department...");

                var datetime = dbfunctions.DateTime(0,0,0,0,0,0);

                dbfunctions.InsertDataInTable("fields_departments","id,department_name,clicks,updated_datetime,create_datetime","'','"+department_name+"','0','"+datetime+"','"+datetime+"'",(error,result)=>{
                    if(error)
                    {
                        // callback(error,null);
                        console.log(error);
                    }
                    else
                    {
                        if(result.affectedRows)
                        {
                            console.log('department Inserted');
                            // console.log(result);
                            //getting department id

                            console.log("getting department id");
                            var datetime = dbfunctions.DateTime(0,0,0,0,0,0);
                            department_id = result.insertId;
                            // console.log(department_id);
                            //checking if designation under this department is already present or not
                            dbfunctions.AnyDbQuery("select id from designation where department_id='"+department_id+"' and designation_name='"+designation_name+"'",(error,result)=>{
                                if(error)
                                {
                                    console.log(error);
                                }
                                else
                                {
                                    if(!Object.values(JSON.parse(JSON.stringify(result))).length)
                                    {
                                        //if designation name is not present under this department then save it in database
                                        dbfunctions.InsertDataInTable("designation","id,department_id,designation_name,roadmap,priority,clicks,updated_datetime,create_datetime","'','"+department_id+"','"+designation_name+"','"+designation_roadmap+"','0','0','"+datetime+"','"+datetime+"'",(error,result)=>{
                                            if(error)
                                            {
                                                console.log(error);
                                            }
                                            else
                                            {
                                                if(result.affectedRows)
                                                {
                                                    console.log(designation_name+" saved! \n");
                                                }
                                                else
                                                {
                                                    console.log("unable to save "+designation_name+"\n");
                                                }
                                            }
                                        });
                                    }
                                }
                            });                              
                        }
                    }
                });
            }
        }
    });
}

function UpdateRoadmap(update_json,callback){
    var action_keys = Object.values(update_json);
    var action_number = action_keys.length;
    for(var u = 0; u < action_number; u++)
    {
        switch(action_keys[u])
        {
            case 'department':{
                var current_name = update_json['department']['current-name'];
                var new_name = update_json['department']['new-name'];
                dbfunctions.UpdateTable("fields_departments",{'department_name':new_name,'updated_datetime':dbfunctions.DateTime(0,0,0,0,0,0)},"department_name='"+current_name+"'",(error,result)=>{
                    if(error)
                    {
                        callback(error,null);
                    }
                    else
                    {
                        callback(null,result);
                    }
                });
            }break;
            case 'designation':{
                var current_name = update_json['designation']['current-name'];
                var new_name = update_json['designation']['new-name'];
                dbfunctions.UpdateTable("designation",{'designation_name':new_name,'updated_datetime':dbfunctions.DateTime(0,0,0,0,0,0)},"designation_name='"+current_name+"'",(error,result)=>{
                    if(error)
                    {
                        callback(error,null);
                    }
                    else
                    {
                        callback(null,result);
                    }
                });
            }break;
            case 'roadmap':{
                var designation_name = update_json['roadmap']['designation-name'];
                var new_roadmap = update_json['roadmap']['new-roadmap'];
                dbfunctions.UpdateTable("designation",{'roadmap':new_roadmap,'updated_datetime':dbfunctions.DateTime(0,0,0,0,0,0)},"designation_name='"+designation_name+"'",(error,result)=>{
                    if(error)
                    {
                        callback(error,null);
                    }
                    else
                    {
                        callback(null,result);
                    }
                });
            }break;
        }
    }
}

function DeteteInRoadmaps(delete_json,callback){
    var action_keys = Object.values(delete_json);
    var action_number = action_keys.length;
    for(var d = 0; d < action_number; d++)
    {
        switch(action_keys[u])
        {
            case 'department':{
                var delete_all_bool = delete_json['department']['delete-all'];
                if(delete_all_bool == "true")
                {
                    // delete all the departments with all the designations and roadmaps
                    //first delete designation table then departments table
                    dbfunctions.AnyDbQuery("TRUNCATE TABLE designation",(error,result)=>{
                        if(error)
                        {
                            callback(error,null);
                        }
                        else
                        {
                            if(result.affectedRows)
                            {
                                dbfunctions.AnyDbQuery("TRUNCATE TABLE fields_departments",(error,result)=>{
                                    if(error)
                                    {
                                        callback(error,null);
                                    }
                                    else
                                    {
                                        callback(null,result);
                                    }
                                });
                            }
                        }
                    });
                }
                else
                {
                    var department_name = delete_json['department']['name'];
                    //if user wnats to delete a single department and all its related designations  
                    dbfunctions.AnyDbQuery("select id form fields_departments where department_name='"+department_name+"'",(error,result)=>{
                        if(error)
                        {
                            callback(error,null);
                        }
                        else
                        {
                            if(result.affectedRows)
                            {
                                dbfunctions.AnyDbQuery("DELETE FROM designation WHERE department_id='"+result[0].id+"'",(error,result)=>{
                                    if(error)
                                    {
                                        callback(error,null);
                                    }
                                    else
                                    {
                                        if(result.affectedRows)
                                        {
                                            //now delete the department
                                            dbfunctions.AnyDbQuery("DELETE FROM fields_departments WHERE department_name='"+department_name+"'",(error,result)=>{
                                                if(error)
                                                {
                                                    callback(error,null);
                                                }
                                                else
                                                {
                                                    callback(null,result);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }break;
            case 'designation':{
                var delete_all_bool = delete_json['designation']['delete-all'];
                if(delete_all_bool == "true")
                {
                    dbfunctions.AnyDbQuery("TRUNCATE TABLE designation",(error,result)=>{
                        if(error)
                        {
                            callback(error,null);
                        }
                        else
                        {
                            callback(null,result);
                        }
                    });
                }
                else
                {
                    var designation_name = delete_json['designation']['name'];
                    //if user wants to delete only one designation
                    dbfunctions.AnyDbQuery("DELETE FROM designation WHERE designation_name='"+designation_name+"'",(error,result)=>{
                        if(error)
                        {
                            callback(error,null);
                        }
                        else
                        {
                            callback(null,result);
                        }
                    });
                }
            }break;
            case 'roadmap':{
                var delete_all_bool = delete_json['roadmap']['delete-all'];
                if(delete_all_bool == "true")
                {
                    //delete roadmaps of all the designations 
                    dbfunctions.AnyDbQuery("UPDATE designation set roadmap='',updated_datetime='"+dbfunctions.DateTime(0,0,0,0,0,0)+"'",(error,result)=>{
                        if(error)
                        {
                            callback(error,null);
                        }
                        else
                        {
                            callback(null,result);
                        }
                    });   
                }
                else
                {
                    var designation_name = delete_json['roadmap']['name'];
                    //delete the roadmap of a specific designation
                    dbfunctions.UpdateTable("designation",{'roadmap':'','updated_datetime':dbfunctions.DateTime(0,0,0,0,0,0)},"designation_name='"+designation_name+"'",(error,result)=>{
                        if(error)
                        {
                            callback(error,null);
                        }
                        else
                        {
                            callback(null,result);
                        }
                    }); 
                } 
            }break;
        }
    }
}

// LearnRoadmap("./roadmap_format.json",(error,result)=>{
//     if(error){
//         console.log(error);
//     }
//     else
//     {
//         console.log(result);
//     }
// });

module.exports = LearnRoadmap;
