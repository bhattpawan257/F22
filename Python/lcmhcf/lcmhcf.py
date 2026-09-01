def lcm(*args):
	a=i=max(args)
	while True:
		for j in args:
			if i%j!=0:
				break
		else:
			return i
		i+=a


def hcf(*args):
    a=min(args)
    i=a
    while i>1:
        for j in args:
            if j%i!=0:
                break
        else:
            return i
        i-=1
    return 1
	
def lcmhcf(*args):
    return lcm(*args),hcf(*args)
    


def hcfv2(*args):
    d=min(args)
    for i in args:
        n=i
        r=1
        while r!=0:
            r=n%d
            if r!=0:n,d=d,r
        else:
            hcf=d
    return hcf




def lcmv2(*args):
    l=args[0]
    for i in args[1:]:
        l=l//hcfv2(l,i)*i
    return l




def isprime(n):
  if (n not in (2,3)) and (n%2==0 or n%3==0):
    return False
  i=5
  while i*i<=n:
    if n%(i)==0 or n%(i+2)==0:
      return False
    i+=6
  return True



def primeFactors(n):
  l=[]
  i=2
  while i*i<n:
    while n%i==0:
      n//=i
      l.append(i)
    if i!=2: i+=2
    else: i+=1 
  l.append(n)
  return l  



















