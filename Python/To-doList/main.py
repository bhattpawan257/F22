import pickle,os

def addToList():
    task=input("Write your task: \n")
    tskNo=len(lst)+1
    lst.append([tskNo,task])

def popTask():
    lst.pop()

def displayList():
    print("\n\t\t\t\tTo-do List")
    for i in lst:
        print("\t",i[0],". ",i[1],sep="")
    print("\n")

def deleteTask():
    tskNo=int(input("Enter task no :"))
    found=0
    templ=[]
    for i in lst:
        if i[0]==tskNo:
            found=1
        elif not found:
            templ.append(i)
        elif found:
            ni=i[0]-1
            templ.append([ni,i[1]])
    lst=list(templ)

def main():
    global lst
    file=open("todolist.dat","rb")
    temp=open("temp.dat","wb")
    lst=pickle.load(file)
    while True:
        print("\t\t\t\tMain Menu")
        print("\t1. Add a new task")
        print("\t2. Display the task list")
        print("\t3. Pop task")
        print("\t4. delete a task")
        print("\t5. Quit")
        ch=input("Enter Your Choice: ")
        match ch:
            case "1":
                addToList()
            case "2":
                displayList()
                input()
            case "3":
                popTask()
            case "4":
                deleteTask()
            case "5":
                break
            case _:
                print("Invalid choice")
    pickle.dump(lst,temp)
    file.close()
    temp.close()
    os.replace("temp.dat","todolist.dat")
    
        

main()