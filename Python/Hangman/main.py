import random,os
STAGES = [
    r"""
       +---+    ♥︎ ♥︎ ♥︎ ♥︎ ♥︎ ♥︎
       |   |
           |
           |
           |
           |
    =========
    """,  # 0 wrong guesses (6 lives left)
    r"""
       +---+    ♥︎ ♥︎ ♥︎ ♥︎ ♥︎ ♡
       |   |
       O   |
           |
           |
           |
    =========
    """,  # 1 wrong guess (5 lives left)
    r"""
       +---+    ♥︎ ♥︎ ♥︎ ♥︎ ♡ ♡
       |   |
       O   |
       |   |
           |
           |
    =========
    """,  # 2 wrong guesses (4 lives left)
    r"""
       +---+    ♥︎ ♥︎ ♥︎ ♡ ♡ ♡
       |   |
       O   |
      /|   |
           |
           |
    =========
    """,  # 3 wrong guesses (3 lives left)
    r"""
       +---+    ♥︎ ♥︎ ♡ ♡ ♡ ♡
       |   |
       O   |
      /|\  |
           |
           |
    =========
    """,  # 4 wrong guesses (2 lives left)
    r"""
       +---+    ♥︎ ♡ ♡ ♡ ♡ ♡
       |   |
       O   |
      /|\  |
      /    |
           |
    =========
    """,   # 5 wrong guesses (1 life left)
    r"""
       +---+    ♡ ♡ ♡ ♡ ♡ ♡
       |   |
       O   |
      /|\  |
      / \  |
           |
    =========
    """   # 6 wrong guesses (0 lives left - Game Over)
]
def drawState(state):
    print(STAGES[state])


def getKey():
    with open("words.txt","r") as f:
        wLst=f.read().split()
        index=random.randint(0,len(wLst)-1)
        key=wLst[index].lower()
        return key


def guess(n,gsls):
    if n==0: drawState(0)
    while True:
        gs=input(f"guess:").lower()
        if len(gs)>1:
            print("enter only one character")
        elif gs in gsls:
            print("guess a new character")
        elif gs.isalpha():
            break
        else:
            print("invalid input")
    gsls.append(gs)
    os.system("clear")
    return gs
    

def game(key,gsls):
    ls=["_"]*len(key)
    print(" ".join(ls))
    n=0
    while n<6:
        gs=guess(n,gsls)
        if gs in key:
            for i in range(len(key)):
                if key[i]==gs:
                    ls[i]=gs
        else:
            n+=1
        print(" ".join(ls))
        print("wrong guesses: ", end="")
        for i in gsls:
            if i not in key:
                print(i,end=" ")
        if n!=0: drawState(n)
        print()
        if "".join(ls)==key:
            print("victory")
            break
    else:
        print("defeat")
        print(f"the word was :{key}")
        return 0
    return (6-n)*1000

def main():
    ch="y"
    while ch in "yY":
        os.system("clear")
        gsls=[]
        key=getKey()
        sc=game(key,gsls)
        ch=input(f"score {sc}\nplay again(y/n): ")

main()