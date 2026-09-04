import random
gsls=[]

def getKey():
    with open("words.txt","r") as f:
        wLst=f.read().split()
        index=random.randint(0,len(wLst)-1)
        key=wLst[index]
        return key


def guess(n):
    while True:
        gs=input(f"lives left {n}:")
        if len(gs)>1:
            print("enter only one character")
        elif gs in gsls:
            print("guess a new character")
        elif gs.isalpha():
            break
        else:
            print("invalid input")
    gsls.append(gs)
    return gs
    

def game(key):
    ls=["_"]*len(key)
    print(" ".join(ls))
    n=5
    while n>0:
        gs=guess(n)
        if gs in key:
            for i in range(len(key)):
                if key[i]==gs:
                    ls[i]=gs
        else:
            n-=1
        print(" ".join(ls))
        if "".join(ls)==key:
            print("victory")
            break
    else:
        print("defeat")
        print(f"the word was :{key}")


def main():
    gsls=[]
    key=getKey()
    game(key)

main()