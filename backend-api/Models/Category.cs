namespace backend_api.Models;

public class Category
{
    public int CategoryID { get; set; }
    public string CategoryName { get; set; } = "";
    public string? IconURL { get; set; }
}
