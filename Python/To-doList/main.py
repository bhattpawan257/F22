import pickle,os


def addToList():
    task=input("Write your task: \n")
    tskNo=len(lst)+1
    lst.append([tskNo,task])


def addtasks():
    task=input("write your task (press q to quit):\n")
    while task not in "qQ":
        task=input()
        if task not in "Qq":
            tskNo=len(lst)+1
            lst.append([tskNo,task])


def popTask():
    try:
        x=lst.pop()
        print(f"{x[0]}.{x[1]} popped from list")
        displayList()
    except:
        input("list empty")


def displayList():
    if len(lst)==0:
        input("list empty")
        return
    print("\n\t\t\t\tTo-do List")
    for i in lst[:-1]:
        print("\t",i[0],". ",i[1],sep="")
    print("\t",lst[-1][0],". ",lst[-1][1],sep="",end="")
    input()

    
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
        print("\t2. Add tasks")
        print("\t3. Display the task list")
        print("\t4. Pop task")
        print("\t5. delete a task")
        print("\t6. Quit")
        ch=input("Enter Your Choice: ")
        match ch:
            case "1":
                addToList()
            case "2":
                addtasks()
            case "3":
                displayList()
            case "4":
                popTask()
            case "5":
                deleteTask()
            case "6":
                break
            case _:
                print("Invalid choice")
    pickle.dump(lst,temp)
    file.close()
    temp.close()
    os.replace("temp.dat","todolist.dat")
    
        

main()