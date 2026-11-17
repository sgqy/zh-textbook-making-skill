# 教材维护任务

请用 textbook-maintain 将下面模拟教材从旧约定更新到新约定，交付修改后的内容和重验说明。不需要发布到外部。

旧约定：Python 函数 mean(values) 在空列表时返回 0。新约定：空列表时抛出 ValueError；非空列表行为保持不变。

已有材料：

```python
def mean(values):
    if not values:
        return 0
    return sum(values) / len(values)
```

正文：“没有样本时也能得到均值 0，因此可以直接比较两组的结果。”

练习：“预测 mean([]) 的输出，并解释没有样本时如何处理。”

答案：“返回 0，空列表均值为 0。”

检查记录：“旧版本只检查 mean([2, 4])，结果为 3.0；未检查空列表。”
